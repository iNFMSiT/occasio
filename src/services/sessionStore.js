// IndexedDB-backed session store for persisting generated images
// Uses two object stores: sessions (metadata) and images (blobs keyed by sessionId + index)

const DB_NAME = 'customcards';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // Sessions store: one record per generation run
      if (!db.objectStoreNames.contains('sessions')) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Images store: individual card images, keyed by compound id
      if (!db.objectStoreNames.contains('images')) {
        const images = db.createObjectStore('images', { keyPath: 'id' });
        images.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generate a short unique ID
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const sessionStore = {
  /**
   * Save a generation session with its cards.
   * @param {Object} params
   * @param {Array} params.cards - Array of card objects with imageUrl, style, theme, prompt, etc.
   * @param {string} params.modelTier - Which model was used
   * @param {number} params.cardCount - How many images were requested
   * @param {string[]} params.styles - Selected art styles
   * @param {string[]} params.themes - Selected themes
   * @param {string} [params.anchorDescription] - Vision model description of the uploaded person
   * @returns {Promise<string>} The session ID
   */
  async saveSession({ cards, modelTier, cardCount, styles, themes, anchorDescription }) {
    const db = await openDB();
    const sessionId = makeId();
    const now = new Date();

    // Build a small thumbnail from the first card for the session list
    const thumbnailUrl = cards[0]?.imageUrl || null;

    const session = {
      id: sessionId,
      createdAt: now.toISOString(),
      modelTier,
      cardCount,
      styles,
      themes,
      anchorDescription: anchorDescription || null,
      imageCount: cards.length,
      // Store a small preview snippet (first card thumbnail) directly on session
      // so we can render session list without loading all images
      thumbnailUrl,
    };

    // Write session metadata
    const txSession = db.transaction('sessions', 'readwrite');
    txSession.objectStore('sessions').put(session);
    await new Promise((resolve, reject) => {
      txSession.oncomplete = resolve;
      txSession.onerror = () => reject(txSession.error);
    });

    // Write each card image separately (keeps individual reads fast)
    const txImages = db.transaction('images', 'readwrite');
    const imageStore = txImages.objectStore('images');
    cards.forEach((card, index) => {
      imageStore.put({
        id: `${sessionId}_${index}`,
        sessionId,
        index,
        imageUrl: card.imageUrl || null,
        style: card.style || '',
        theme: card.theme || '',
        prompt: card.prompt || '',
        composition: card.composition || '',
        mood: card.mood || '',
        rating: card.rating ?? null,
      });
    });
    await new Promise((resolve, reject) => {
      txImages.oncomplete = resolve;
      txImages.onerror = () => reject(txImages.error);
    });

    db.close();
    return sessionId;
  },

  /**
   * Get all sessions, newest first.
   * @returns {Promise<Array>} Session metadata objects
   */
  async getSessions() {
    const db = await openDB();
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');

    return new Promise((resolve, reject) => {
      const request = store.index('createdAt').getAll();
      request.onsuccess = () => {
        db.close();
        // Reverse so newest is first
        resolve(request.result.reverse());
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  },

  /**
   * Get all images for a specific session.
   * @param {string} sessionId
   * @returns {Promise<Array>} Image objects sorted by index
   */
  async getSessionImages(sessionId) {
    const db = await openDB();
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(sessionId);
      request.onsuccess = () => {
        db.close();
        resolve(request.result.sort((a, b) => a.index - b.index));
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  },

  /**
   * Delete a session and all its images.
   * @param {string} sessionId
   */
  async deleteSession(sessionId) {
    const db = await openDB();

    // Delete images first
    const txImages = db.transaction('images', 'readwrite');
    const imageStore = txImages.objectStore('images');
    const imageIndex = imageStore.index('sessionId');

    const imageKeys = await new Promise((resolve, reject) => {
      const req = imageIndex.getAllKeys(sessionId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const txDel = db.transaction('images', 'readwrite');
    const delStore = txDel.objectStore('images');
    imageKeys.forEach((key) => delStore.delete(key));
    await new Promise((resolve, reject) => {
      txDel.oncomplete = resolve;
      txDel.onerror = () => reject(txDel.error);
    });

    // Delete session
    const txSession = db.transaction('sessions', 'readwrite');
    txSession.objectStore('sessions').delete(sessionId);
    await new Promise((resolve, reject) => {
      txSession.oncomplete = resolve;
      txSession.onerror = () => reject(txSession.error);
    });

    db.close();
  },

  /**
   * Update the rating on a specific image.
   * @param {string} sessionId
   * @param {number} imageIndex
   * @param {number|null} rating - The rating value (-5 to +5) or null to clear
   */
  async updateImageRating(sessionId, imageIndex, rating) {
    const db = await openDB();
    const id = `${sessionId}_${imageIndex}`;
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');

    const existing = await new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (existing) {
      existing.rating = rating;
      store.put(existing);
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    }

    db.close();
  },

  /**
   * Get total storage usage estimate (number of sessions and approximate size).
   */
  async getStats() {
    const sessions = await this.getSessions();
    return {
      sessionCount: sessions.length,
      totalImages: sessions.reduce((sum, s) => sum + s.imageCount, 0),
    };
  },
};

export default sessionStore;

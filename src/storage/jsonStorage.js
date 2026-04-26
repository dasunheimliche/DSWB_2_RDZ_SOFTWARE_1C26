const fs = require('fs');
const path = require('path');

class JsonStorage {
  constructor(fileName) {
    this.filePath = path.join(__dirname, '..', '..', 'data', fileName);
    this._ensureFile();
  }

  _ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf-8');
    }
  }

  readAll() {
    const raw = fs.readFileSync(this.filePath, 'utf-8');
    return JSON.parse(raw || '[]');
  }

  writeAll(items) {
    fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
  }

  findById(id) {
    return this.readAll().find((item) => item.id === id);
  }

  insert(item) {
    const items = this.readAll();
    items.push(item);
    this.writeAll(items);
    return item;
  }

  update(id, changes) {
    const items = this.readAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...changes, id };
    this.writeAll(items);
    return items[index];
  }

  remove(id) {
    const items = this.readAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    this.writeAll(items);
    return true;
  }
}

module.exports = JsonStorage;

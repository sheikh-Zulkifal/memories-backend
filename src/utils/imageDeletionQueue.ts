import fs from "fs";

const queue: string[] = [];
let processing = false;
export const imageDeletionQueue = {
  add: (filepath: string) => {
    queue.push(filepath);
    imageDeletionQueue.process();
  },
  process: () => {
    if (processing || queue.length === 0) return;
    

    processing: true;
    const filepath = queue.shift();

    if (filepath && fs.existsSync(filepath)) {
      fs.unlink(filepath, (err) => {
        if (err) console.log("Failed to delete file", filepath, err);
        else console.log("Deleted File", filepath);
        processing: false;
        imageDeletionQueue.process();
      });
    } else {
      processing: false;
      imageDeletionQueue.process();
    }
  },
};

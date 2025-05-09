import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const getFileUrl = (req, filePath) => {
  const relativePath = path.relative(path.join(__dirname, ".."), filePath).replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${relativePath}`;
};

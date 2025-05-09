// utils/authHelpers.js
export const isOwner = (file, userId) => file.uploadedBy.toString() === userId;

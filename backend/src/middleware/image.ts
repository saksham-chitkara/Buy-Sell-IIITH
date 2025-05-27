import { Request, Response, NextFunction } from "express";

const DEFAULT_IMAGES = {
  items: "https://res.cloudinary.com/dzuw1wuki/image/upload/v1701234567/default-item",
  users: "https://res.cloudinary.com/dzuw1wuki/image/upload/v1701234567/default-avatar",
};

export const imageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const pathSegments = req.path.split("/");
  const category = pathSegments[1] as "items" | "users";

  if (category === "items" || category === "users") {
    res.redirect(DEFAULT_IMAGES[category]);
  } else {
    res.status(404).send("Image not found");
  }
};

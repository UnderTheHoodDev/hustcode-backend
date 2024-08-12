import Elysia from "elysia";
import logger from "../configs/logger";

const authMiddleware = new Elysia().guard({
  as: "global",
  beforeHandle() {
    logger.info("authenticating...");
  },
});

export default authMiddleware;

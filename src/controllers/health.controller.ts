import Elysia from "elysia";
import prisma from "@/configs/prisma";

const healthCheckController = new Elysia({ prefix: "/api/v1/health" })
  .get(
    "/",
    async ({ set }) => {
        const data = {
            uptime: formatTime(process.uptime()),
            message: "Ok",
            date: new Date().toLocaleString(),
            db_connect: "Success",
        };
    
        function formatTime(seconds: number): string {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${padZero(hours)}h:${padZero(minutes)}m:${padZero(
                remainingSeconds
            )}s`;
        }
        function padZero(value: number): string {
            return value.toString().padStart(2, "0");
        }
        try {
            await prisma.user.findMany();
            return data
        } catch (error) {
            data.db_connect = "Failed";
            data.message = "Database connection failed";
            set.status = "Internal Server Error";
            return data;
        }
    },
  )

export default healthCheckController;

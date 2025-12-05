import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

// Routes
import authRoutes from "./src/routes/authRoutes.js";
import biodataRoutes from "./src/routes/biodataRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import successStoryRoutes from "./src/routes/successStoryRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Matrimony Platform API",
      version: "1.0.0",
      description: "API Documentation for the Matrimony MERN Application",
    },
    servers: [
      {
        url: "https://soulmate-server-sepia.vercel.app",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "https",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        SuccessStory: {
          type: "object",
          properties: {
            _id: { type: "string" },
            selfBiodataId: { type: "number" },
            partnerBiodataId: { type: "number" },
            coupleImage: { type: "string" },
            successStoryText: { type: "string" },
            marriageDate: { type: "string", format: "date" },
            reviewStar: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Favourite: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userEmail: { type: "string" },
            biodataId: { type: "number" },
            name: { type: "string" },
            permanentAddress: { type: "string" },
            occupation: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Biodata: {
          type: "object",
          properties: {
            biodataId: { type: "number" },
            userEmail: { type: "string" },
            name: { type: "string" },
            biodataType: { type: "string", enum: ["Male", "Female"] },
            profileImage: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            age: { type: "number" },
            height: { type: "number" },
            weight: { type: "number" },
            occupation: { type: "string" },
            race: { type: "string" },
            fathersName: { type: "string" },
            mothersName: { type: "string" },
            permanentDivision: { type: "string" },
            presentDivision: { type: "string" },
            expectedPartnerAge: { type: "string" },
            expectedPartnerHeight: { type: "string" },
            expectedPartnerWeight: { type: "string" },
            mobileNumber: { type: "string" },
            contactEmail: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // INPUT SCHEMA
        SuccessStoryInput: {
          type: "object",
          required: [
            "selfBiodataId",
            "partnerBiodataId",
            "coupleImage",
            "successStoryText",
          ],
          properties: {
            selfBiodataId: {
              type: "number",
              example: 101,
            },
            partnerBiodataId: {
              type: "number",
              example: 202,
            },
            coupleImage: {
              type: "string",
              example: "https://example.com/couple.jpg",
            },
            successStoryText: {
              type: "string",
              example: "We met on this platform and are now happily married!",
            },
            marriageDate: {
              type: "string",
              format: "date",
              example: "2024-01-15",
            },
            reviewStar: {
              type: "number",
              example: 5,
            },
          },
        },
        FavouriteInput: {
          type: "object",
          required: ["userEmail", "biodataId"],
          properties: {
            userEmail: {
              type: "string",
              example: "user@example.com",
            },
            biodataId: {
              type: "number",
              example: 105,
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            permanentAddress: {
              type: "string",
              example: "Dhaka, Bangladesh",
            },
            occupation: {
              type: "string",
              example: "Software Engineer",
            },
          },
        },

        PaymentIntentInput: {
          type: "object",
          required: ["price"],
          properties: {
            price: { type: "number", example: 5 },
          },
        },

        PaymentIntentOutput: {
          type: "object",
          properties: {
            clientSecret: {
              type: "string",
              example: "pi_123456_secret_abcdef",
            },
          },
        },

        SavePaymentInput: {
          type: "object",
          required: ["biodataId", "userEmail", "transactionId"],
          properties: {
            biodataId: { type: "number", example: 101 },
            userEmail: { type: "string", example: "user@example.com" },
            transactionId: { type: "string", example: "txn_1A2B3C4D" },
          },
        },

        BiodataInput: {
          type: "object",
          required: ["userEmail", "name", "biodataType"],
          properties: {
            userEmail: { type: "string" },
            name: { type: "string" },
            biodataType: { type: "string", enum: ["Male", "Female"] },
            profileImage: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            age: { type: "number" },
            height: { type: "number" },
            weight: { type: "number" },
            occupation: { type: "string" },
            race: { type: "string" },
            fathersName: { type: "string" },
            mothersName: { type: "string" },
            permanentDivision: { type: "string" },
            presentDivision: { type: "string" },
            expectedPartnerAge: { type: "string" },
            expectedPartnerHeight: { type: "string" },
            expectedPartnerWeight: { type: "string" },
            mobileNumber: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Route Mounting
app.use("/auth", authRoutes);
app.use("/biodatas", biodataRoutes);
app.use("/users", userRoutes);
app.use("/payment", paymentRoutes);
app.use("/admin", adminRoutes);
app.use("/success-stories", successStoryRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Matrimony Server is Running");
});

export default app;

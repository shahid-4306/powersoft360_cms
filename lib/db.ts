// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error("Please define MONGODB_URI in your .env.local file.");
// }

// declare global {
//   var mongooseConn:
//     | {
//         conn: typeof mongoose | null;
//         promise: Promise<typeof mongoose> | null;
//       }
//     | undefined;
// }

// const cached = global.mongooseConn ?? {
//   conn: null,
//   promise: null,
// };

// global.mongooseConn = cached;

// export default async function dbConnect(): Promise<typeof mongoose> {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI, {
//       bufferCommands: false,
//       maxPoolSize: 10,
//       minPoolSize: 2,
//       serverSelectionTimeoutMS: 10000,
//       socketTimeoutMS: 45000,
//     });
//   }

//   try {
//     cached.conn = await cached.promise;

//     console.log("✅ MongoDB Connected");
//     console.log("Database:", mongoose.connection.name);
//     console.log("Host:", mongoose.connection.host);

//     return cached.conn;
//   } catch (error) {
//     cached.promise = null;

//     console.error("❌ MongoDB Connection Error");
//     console.error(error);

//     throw error;
//   }
// }

// export async function checkDbHealth() {
//   try {
//     await dbConnect();

//     const db = mongoose.connection.db;

//     if (!db) {
//       return {
//         ok: false,
//         message: "Database not initialized",
//       };
//     }

//     await db.admin().ping();

//     return {
//       ok: true,
//       database: mongoose.connection.name,
//       host: mongoose.connection.host,
//       readyState: mongoose.connection.readyState,
//       collections: (await db.listCollections().toArray()).map((c) => c.name),
//     };
//   } catch (error) {
//     return {
//       ok: false,
//       error: error instanceof Error ? error.message : String(error),
//     };
//   }
// }

// export function disconnectDB() {
//   return mongoose.disconnect();
// }

import mongoose from "mongoose";

function getMongoDBUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please define MONGODB_URI in your .env.local file.");
  }

  return uri;
}

// FIX: previously `MONGODB_URI` was `string | undefined` at the call site
// inside `dbConnect`, because TypeScript doesn't carry the `if (!MONGODB_URI)
// throw` narrowing across a function boundary/closure. Validating and
// returning it from a function with an explicit `string` return type makes
// `MONGODB_URI` genuinely typed as `string` everywhere below — no unsafe
// `as string` cast needed, and the runtime behavior (throw when missing) is
// unchanged.
const MONGODB_URI = getMongoDBUri();

declare global {
  var mongooseConn:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseConn ?? {
  conn: null,
  promise: null,
};

global.mongooseConn = cached;

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  }

  try {
    cached.conn = await cached.promise;

    console.log("✅ MongoDB Connected");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);

    return cached.conn;
  } catch (error) {
    cached.promise = null;

    console.error("❌ MongoDB Connection Error");
    console.error(error);

    throw error;
  }
}

export async function checkDbHealth() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;

    if (!db) {
      return {
        ok: false,
        message: "Database not initialized",
      };
    }

    await db.admin().ping();

    return {
      ok: true,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      readyState: mongoose.connection.readyState,
      collections: (await db.listCollections().toArray()).map((c) => c.name),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function disconnectDB() {
  return mongoose.disconnect();
}

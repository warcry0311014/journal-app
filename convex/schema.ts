import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  entries: defineTable({
    userId: v.string(),
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),
});

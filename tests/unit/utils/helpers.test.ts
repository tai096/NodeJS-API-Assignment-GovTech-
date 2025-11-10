import { isValidEmail, extractMentions } from "../../../src/utils/helpers.js";

describe("Utils - Helpers", () => {
    describe("isValidEmail", () => {
        it("should return true for valid email addresses", () => {
            expect(isValidEmail("test@example.com")).toBe(true);
            expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
            expect(isValidEmail("first+last@example.org")).toBe(true);
            expect(isValidEmail("email123@test123.com")).toBe(true);
        });

        it("should return false for invalid email addresses", () => {
            expect(isValidEmail("invalid")).toBe(false);
            expect(isValidEmail("@example.com")).toBe(false);
            expect(isValidEmail("test@")).toBe(false);
            expect(isValidEmail("test @example.com")).toBe(false);
            expect(isValidEmail("test@.com")).toBe(false);
            expect(isValidEmail("")).toBe(false);
        });

        it("should return false for emails with missing parts", () => {
            expect(isValidEmail("test")).toBe(false);
            expect(isValidEmail("test@domain")).toBe(false);
            expect(isValidEmail("@domain.com")).toBe(false);
        });

        it("should return false for emails with spaces", () => {
            expect(isValidEmail("test user@example.com")).toBe(false);
            expect(isValidEmail("testuser@exam ple.com")).toBe(false);
        });

        it("should handle edge cases", () => {
            expect(isValidEmail("a@b.c")).toBe(true);
            expect(isValidEmail("test..email@example.com")).toBe(true); // Some systems allow this
        });
    });

    describe("extractMentions", () => {
        it("should extract single email mention from text", () => {
            const text = "Hello @student@example.com";
            const result = extractMentions(text);

            expect(result).toEqual(["student@example.com"]);
        });

        it("should extract multiple email mentions from text", () => {
            const text = "Hello @student1@example.com and @student2@test.com";
            const result = extractMentions(text);

            expect(result).toEqual(["student1@example.com", "student2@test.com"]);
        });

        it("should return empty array when no mentions found", () => {
            const text = "Hello world, no mentions here";
            const result = extractMentions(text);

            expect(result).toEqual([]);
        });

        it("should handle text with @ but not valid email mentions", () => {
            const text = "Email me at support@ or @invalid";
            const result = extractMentions(text);

            expect(result).toEqual([]);
        });

        it("should extract mentions from complex notification text", () => {
            const text = "Hello students! @studentagnes@example.com @studentmiche@example.com";
            const result = extractMentions(text);

            expect(result).toEqual([
                "studentagnes@example.com",
                "studentmiche@example.com",
            ]);
        });

        it("should handle mentions at the start of text", () => {
            const text = "@student@example.com please check";
            const result = extractMentions(text);

            expect(result).toEqual(["student@example.com"]);
        });

        it("should handle mentions at the end of text", () => {
            const text = "Please notify @student@example.com";
            const result = extractMentions(text);

            expect(result).toEqual(["student@example.com"]);
        });

        it("should handle empty string", () => {
            const result = extractMentions("");

            expect(result).toEqual([]);
        });

        it("should handle mentions with different domains", () => {
            const text = "@user1@gmail.com @user2@yahoo.co.uk @user3@test.org";
            const result = extractMentions(text);

            expect(result).toEqual([
                "user1@gmail.com",
                "user2@yahoo.co.uk",
                "user3@test.org",
            ]);
        });

        it("should not extract emails without @ prefix", () => {
            const text = "Contact student@example.com for more info";
            const result = extractMentions(text);

            expect(result).toEqual([]);
        });

        it("should handle multiple @ symbols correctly", () => {
            const text = "@@student@example.com";
            const result = extractMentions(text);

            expect(result).toEqual(["student@example.com"]);
        });
    });
});

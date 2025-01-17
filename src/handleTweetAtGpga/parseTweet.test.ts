import { parseTweet, TweetAtGpgaType } from "./parseTweet";

describe("parseTweet", () => {
  it("should by default say irrelevant", () => {
    const result = parseTweet(``);
    expect(result.type).toBe(TweetAtGpgaType.Irrelevant);
  });

  it("should return irrelevant", () => {
    const result = parseTweet(`some irrelevant words.`);
    expect(result.type).toBe(TweetAtGpgaType.Irrelevant);
  });

  it("should return RequestingCompanyGpg if tweet contains phrase", () => {
    const result = parseTweet(`@PayGapApp what is the gender pay gap for X.`);
    expect(result.type).toBe(TweetAtGpgaType.RequestingCompanyGpg);
    expect(result.companyName).toBe("x");
  });

  it("should be case insensitive", () => {
    const result = parseTweet(`@PayGapApp what is the Gender Pay Gap for X.`);
    expect(result.type).toBe(TweetAtGpgaType.RequestingCompanyGpg);
    expect(result.companyName).toBe("x");
  });

  it("should be case insensitive", () => {
    const result = parseTweet(
      `@PayGapApp what is the Gender Pay Gap for A long company name.`
    );
    expect(result.type).toBe(TweetAtGpgaType.RequestingCompanyGpg);
    expect(result.companyName).toBe("a long company name");
  });

  it("should be a simple short request", () => {
    const result = parseTweet(
      `@PayGapApp I need you to know Gender Pay Gap for some long sentence which happens to contain the words`
    );
    expect(result.type).toBe(TweetAtGpgaType.Irrelevant);
  });
});

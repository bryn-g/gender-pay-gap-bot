import { Logger } from "tslog";
import { Repository } from "../importData/Repository";
import { TwitterClient } from "../twitter/Client";
import { getMostRecentMedianGPGOrThrow } from "../utils/getMostRecentGPG";
import { CopyWriter } from "../copyWriter/CopyWriter";
import { HandleIncomingTweetInput } from "../queueTweets/IncomingTweetListenerQueuer";
import { parseTweet } from "./parseTweet";
import { TweetAtGpgaType } from "./parseTweet.test";
import { shouldNeverHappen } from "../utils/shouldNeverHappen";
import { LambdaLogger } from "../lambdaLogger";

export class SqsTweetProcessor {
  twitterClient: TwitterClient;
  logger: LambdaLogger;
  repository: Repository;
  copyWriter: CopyWriter;

  constructor(twitterClient: TwitterClient, repo: Repository) {
    this.twitterClient = twitterClient;
    this.logger = new LambdaLogger("HandleTweetAtGpgaTweetAtGpgaSqsTweetProcessor");
    this.repository = repo;
    this.copyWriter = new CopyWriter();
  }

  async process(input: HandleIncomingTweetInput) {
    try {
      // TODO decide if its relevant / parsable.
      this.logger.logEvent({
        message: "processing sqs record",
        eventType: "processingRecordTweetAtGpga",
        twitterUserId: input.twitterUserId,
        tweetId: input.tweetId,
        screenName: input.screenName,
      }
      );

      // parse tweet.
      const parsedTweetResult = parseTweet(input.text);

      switch (parsedTweetResult.type) {
        case TweetAtGpgaType.RequestingCompanyGpg:
          if (!parsedTweetResult.companyName) {
            throw new Error("no company name");
          }
          await this.handleRelevantTweet(parsedTweetResult.companyName, input);
          return;
        case TweetAtGpgaType.Irrelevant:
          // if unparsable then  reply with something else or ignore.
          return;

        default:
          shouldNeverHappen(parsedTweetResult.type);
          return;
      }
    } catch (error) {
      this.logger.logEvent(
        {
          message: "error sending tweet",
          eventType: "errorHandlingTweetAtGpga",
          tweetId: input.tweetId,
          twitterUserId: input.twitterUserId,
          screenName: input.screenName,
        }
      );
      // todo handle error case somehow.
      throw error;
    }
  }

  async handleRelevantTweet(
    companyName: string,
    input: HandleIncomingTweetInput
  ) {
    this.logger.logEvent({
      message: "would have tweeted for input:", data: input,
      eventType: "tweetAtUsHandleRelevantTweet"
    });
    this.repository.checkSetData();
    const company = this.repository.fuzzyFindCompanyByName(companyName);

    // if parsable

    // get company(s) by name
    // const data = this.repository.getGpgForTwitterId(twitterUserId);
    // if (!data || !data.companyData) {
    //   this.logger.error(
    //     JSON.stringify({
    //       message: "error finding company",
    //       eventType: "errorGettingCompany",
    //       tweetId,
    //       twitterUserId,
    //       errorHandlingTweetAtGpga: 1,
    //       screenName,
    //     })
    //   );
    //   throw new Error(
    //     `could not find company. TwitterUserId: ${twitterUserId}, ${screenName}`
    //   );
    // }

    // build copy and stuff

    // const mostRecentGPG = getMostRecentMedianGPGOrThrow(data.companyData);

    // const copy =
    //   this.copyWriter.medianGpgWithDifferenceYearOnYearForThisOrganisation(
    //     data.companyData
    //   );
    // TODO reply to the tweet rather than quote tweeting.
    // await this.twitterClient.replyToTweet(
    //   {
    //     tweet: copy,
    //     replyTweetId: tweetId,
    //     screenName: data.twitterData.twitter_screen_name,
    //   }
    // );
    this.logger.logEvent({
      message: "sent tweet in reply to tweeting at gpga",
      eventType: "sentTweetReplyToTweetingAtGpga",
      tweetId: input.tweetId,
      twitterUserId: input.twitterUserId,
      screenName: input.screenName,
      // companyName: data.companyData.companyName,
      successfullySentTweet: 1,
    }
    );
  }
}

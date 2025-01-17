import DataImporter from "../importData";
import { Repository } from "../importData/Repository";
import { HandleIncomingTweetInput } from "../queueTweets/IncomingTweetListenerQueuer";
import { TwitterClient } from "../twitter/Client";
import { SqsTweetProcessor } from "./SqsTweetProcessor";

const dataImporter = new DataImporter();
const twitterClient = new TwitterClient();
const repo = new Repository(dataImporter);
const processor = new SqsTweetProcessor(twitterClient, repo);

export async function handler(event: any, context: any) {
  for (let index = 0; index < event.Records.length; index++) {
    const record = event.Records[index];
    const { body } = record;
    const parsedBody = JSON.parse(body) as HandleIncomingTweetInput;

    await processor.process(parsedBody);
  }
  return {};
}

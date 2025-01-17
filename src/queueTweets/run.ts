import dotEnv from "dotenv";
import { SqsClient } from "../sqs/Client";
import { Logger } from "tslog";
import { TwitterClient } from "../twitter/Client";
import { IncomingTweetListenerQueuer } from "./IncomingTweetListenerQueuer";
import DataImporter from "../importData";
import { Repository } from "../importData/Repository";
import { isDebugMode } from "../utils/debug";
import { getEnvVar } from "../utils/getEnvVar";

const logger = new Logger();
try {
  logger.info("Started listening at time: " + new Date().toISOString());

  logger.info(
    JSON.stringify({
      message: `starting listener.`,
      eventType: "startingListener",
    })
  );
  dotEnv.config();

  const twitterClient = new TwitterClient();
  const sqsClientTweetAtGpga = new SqsClient(
    getEnvVar("TWEET_AT_GPGA_SQS_QUEUE_URL")
  );
  const dataImporter = new DataImporter();
  const repository = new Repository(dataImporter);

  const handler = new IncomingTweetListenerQueuer(
    twitterClient,
    sqsClientTweetAtGpga,
    dataImporter,
    repository,
    logger
  );

  const isTest = isDebugMode();

  handler.listen(isTest);
} catch (err) {
  logger.info(
    JSON.stringify({
      message: "threw while starting!",
      eventType: "errorStartingListener",
      error: err,
    })
  );
  process.exit(1);
}

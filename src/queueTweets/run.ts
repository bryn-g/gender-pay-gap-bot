import dotEnv from "dotenv"
import { SqsClient } from "../sqs/Client"
import { Logger } from "tslog"
import { TwitterClient } from "../twitter/Client"
import { IncomingTweetListenerQueuer, relevantWords } from "./IncomingTweetListenerQueuer"
import DataImporter from "../importData"
import { Repository } from "../importData/Repository"
import { isDebugMode } from "../utils/debug"

const logger = new Logger()
logger.info(
    JSON.stringify({
        message: `starting listener. Listening for words: ${JSON.stringify(relevantWords)}`,
        eventType: "startingListener",
    })
);
dotEnv.config()

const twitterClient = new TwitterClient()
const sqsClient = new SqsClient()
const dataImporter = new DataImporter()
const repository = new Repository(dataImporter)

const handler = new IncomingTweetListenerQueuer(twitterClient, sqsClient, dataImporter, repository, logger)

const isTest = isDebugMode()

handler.listen(isTest)

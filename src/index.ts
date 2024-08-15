import "reflect-metadata"
import createClient from "openapi-fetch";
import { hexToString, stringToHex } from "viem"
import { components, paths } from "./schema";
import { DappStorage } from "./data-source";
import { Player } from "./entity/player";
import { Numberle } from "./entity/numberle";

type AdvanceRequestData = components["schemas"]["Advance"];
type InspectRequestData = components["schemas"]["Inspect"];
type RequestHandlerResult = components["schemas"]["Finish"]["status"];
type RollupsRequest = components["schemas"]["RollupRequest"];
type InspectRequestHandler = (data: InspectRequestData) => Promise<void>;
type AdvanceRequestHandler = (
  data: AdvanceRequestData
) => Promise<RequestHandlerResult>;

const rollupServer = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollupServer);

const { POST } = createClient<paths>({ baseUrl: rollupServer })

const postNotice = async (data: string) => {
  const payload = stringToHex(data)
  await POST("/notice", {
    body: { payload }
  })
}

const getPlayer = async (id: `0x${string}`) => {
  const playerRepo = DappStorage.getRepository(Player)
  const player = await playerRepo.findOneBy({ id })

  return player ?? new Player(id)
}

const getGame = async (gameId: string) => {
  const gameRepo = DappStorage.getRepository(Numberle)
  const game = await gameRepo.findOne({
    where: { id: gameId },
    relations: {
      player: true
    }
  })

  return game
}

const handleAdvance: AdvanceRequestHandler = async ({ metadata, payload }) => {
  const { msg_sender } = metadata
  const { action, data } = JSON.parse(hexToString(payload))

  const gameRepo = DappStorage.getRepository(Numberle)

  if (action === "new_game") {
    const player = await getPlayer(msg_sender)
    const game = await gameRepo.save(new Numberle(player))
    await postNotice(JSON.stringify({ game_id: game.id, game_state: game.gameState }))

    return "accept"
  }

  if (action === "attempt") {
    const { game_id, submission } = data
    const game = await getGame(game_id)

    if (!game) {
      // todo: post report?
      return "reject"
    }

    const gameState = game.attempt(submission)

    if (gameState) {
      const { state } = gameState
      if (state === "playing") {
        await gameRepo.save(game)
        await postNotice(JSON.stringify({ game_id, game_state: gameState }))
      } else {
        const player = game.player
        const playerRepo = DappStorage.getRepository(Player)

        // make sure to save any changes to player stats
        await playerRepo.save(player)

        // remove finished game
        await gameRepo.remove(game)
      }
    } else {
      await gameRepo.remove(game)
    }

    return "accept"
  }

  // unknown/unhandled
  return "reject"
}

const handleInspect: InspectRequestHandler = async (data) => {
  console.log("Received inspect request data " + JSON.stringify(data));
};

const main = async () => {
  await DappStorage.initialize()
  console.log("DataSource initialized")

  let status: RequestHandlerResult = "accept";
  while (true) {
    const { response } = await POST("/finish", {
      body: { status },
      parseAs: "text",
    });

    if (response.status === 200) {
      const data = (await response.json()) as RollupsRequest;
      switch (data.request_type) {
        case "advance_state":
          status = await handleAdvance(data.data as AdvanceRequestData);
          break;
        case "inspect_state":
          await handleInspect(data.data as InspectRequestData);
          break;
      }
    } else if (response.status === 202) {
      console.log(await response.text());
    }
  }
};

main().catch((e) => {
  console.log(e);
  process.exit(1);
});

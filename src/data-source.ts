import { DataSource } from "typeorm"
import { Numberle } from "./entity/numberle"
import { Player } from "./entity/player"
import { Init1723557242783 } from "./migration/1723557242783-Init"

export const DappStorage = new DataSource({
  type: "sqlite",
  database: "dapp.db",
  entities: [Numberle, Player],
  migrations: [Init1723557242783],
  migrationsRun: true
})

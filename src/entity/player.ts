import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm"
import type { Relation } from "typeorm"
import { Numberle } from "./numberle"

@Entity()
export class Player {
  @PrimaryColumn("text")
  readonly id: string

  @Column("int")
  private played: number

  @Column("int")
  private solved: number

  @Column("int")
  private streak: number

  @OneToMany(() => Numberle, (numberle) => numberle.player)
  games: Relation<Numberle[]> | undefined

  constructor(id: string) {
    this.id = id
    this.played = 0
    this.solved = 0
    this.streak = 0
  }

  updateStats(game: Numberle) {
    const { player: { id } } = game
    if (this.id !== id) return // not own game

    const { state } = game.gameState
    if (state === "ready" || state === "playing") return // we only update stats when game is over

    this.played += 1
    if (state === "solved") {
      this.solved += 1
      this.streak += 1
    } else { // failed
      this.streak = 0
    }
  }

  get stats() {
    return {
      player: this.id,
      played: this.played,
      solved: this.solved,
      streak: this.streak
    }
  }
}

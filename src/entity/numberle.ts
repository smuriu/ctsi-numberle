import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm"
import type { Relation } from "typeorm"
import { equationGenerator } from "../generator"
import { Player } from "./player"

export type GameState = | {
  state: "ready"
} | {
  state: "playing"
  attempts: number
  hint?: number[]
} | {
  state: "solved"
  attempts: number
  soln: string
} | {
  state: "failed"
  attempts: number
  soln: string
}

const MAX_ATTEMPTS = 6

@Entity()
export class Numberle {
  @PrimaryGeneratedColumn("uuid")
  readonly id: string | undefined

  @ManyToOne(() => Player, (player) => player.games, {
    cascade: true
  })
  @JoinColumn()
  readonly player: Relation<Player>

  @Column("text")
  private state: "ready" | "playing" | "solved" | "failed"

  @Column("int")
  private attempts: number

  @Column("text")
  private equation: string

  private hint: number[] | undefined

  constructor(player: Player) {
    this.player = player
    this.attempts = 0
    this.equation = equationGenerator().genEquation()
    this.state = "ready"
  }

  private evaluate(submission: string) {
    const scores = submission.split('').map((char, index) => {
      let score = 0
      if (this.equation.charAt(index) === char) {
        score = 2
      } else if (this.equation.includes(char)) {
        score = 1
      }
      return score
    })

    return scores
  }

  attempt(submission: string) {
    if (this.state === "ready") {
      this.state = "playing"
    }

    if (this.state === "playing") {
      this.attempts += 1

      const scores = this.evaluate(submission)
      const total = scores.reduce((acc, val) => acc + val, 0)

      if (2 * this.equation.length === total) { // max points
        this.state = "solved"
      } else {
        if (this.attempts < MAX_ATTEMPTS) {
          this.hint = scores
        } else {
          this.state = "failed"
        }
      }

      this.player.updateStats(this)
      return this.gameState
    }
  }

  get gameState(): GameState {
    if (this.state === "ready") {
      return { state: this.state }
    } else if (this.state === "playing") {
      return { state: this.state, attempts: this.attempts, hint: this.hint }
    } else { // solved, failed
      return { state: this.state, attempts: this.attempts, soln: this.equation }
    }
  }
}

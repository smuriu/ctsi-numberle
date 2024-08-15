import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1723557242783 implements MigrationInterface {
    name = 'Init1723557242783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player" ("id" text PRIMARY KEY NOT NULL, "played" integer NOT NULL, "solved" integer NOT NULL, "streak" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "numberle" ("id" varchar PRIMARY KEY NOT NULL, "state" text NOT NULL, "attempts" integer NOT NULL, "equation" text NOT NULL, "playerId" text)`);
        await queryRunner.query(`CREATE TABLE "temporary_numberle" ("id" varchar PRIMARY KEY NOT NULL, "state" text NOT NULL, "attempts" integer NOT NULL, "equation" text NOT NULL, "playerId" text, CONSTRAINT "FK_3c7ff2574d048b1d921efb52e25" FOREIGN KEY ("playerId") REFERENCES "player" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_numberle"("id", "state", "attempts", "equation", "playerId") SELECT "id", "state", "attempts", "equation", "playerId" FROM "numberle"`);
        await queryRunner.query(`DROP TABLE "numberle"`);
        await queryRunner.query(`ALTER TABLE "temporary_numberle" RENAME TO "numberle"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "numberle" RENAME TO "temporary_numberle"`);
        await queryRunner.query(`CREATE TABLE "numberle" ("id" varchar PRIMARY KEY NOT NULL, "state" text NOT NULL, "attempts" integer NOT NULL, "equation" text NOT NULL, "playerId" text)`);
        await queryRunner.query(`INSERT INTO "numberle"("id", "state", "attempts", "equation", "playerId") SELECT "id", "state", "attempts", "equation", "playerId" FROM "temporary_numberle"`);
        await queryRunner.query(`DROP TABLE "temporary_numberle"`);
        await queryRunner.query(`DROP TABLE "numberle"`);
        await queryRunner.query(`DROP TABLE "player"`);
    }

}

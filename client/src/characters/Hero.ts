import FighterCharacter from "./FighterCharacter";

function getExperienceForLevel(level: number): number {
  return level * 100;
}

function getStatsPointsForLevel(level: number): number {
  return level * 10;
}

export default class Hero extends FighterCharacter {
  private static readonly HERO_WIDTH = 32;
  private static readonly HERO_HEIGHT = 48;
  private static readonly HERO_SPRITE_SHEET_TILE_WIDTH = 32;
  private static readonly HERO_SPRITE_SHEET_TILE_HEIGHT = 48;
  private static readonly HERO_ANIMATION_FRAMES = {
    down: [0, 1, 2],
    left: [3, 4, 5],
    right: [6, 7, 8],
    up: [9, 10, 11],
  };
  private static readonly HERO_INACTIVE_FRAME_INDEX = 1; // Index of the inactive frame

  private experience: number = 0;
  private experienceAtCurrentLevel: number = 0;
  private experienceToNextLevel: number = 100;
  private statsPoints: number = 0; // Points to distribute to stats
  private gold: number = 0;

  /**
   * Creates a new `Hero` instance.
   * @param name - The name of the hero.
   * @param x - The initial x-coordinate of the hero.
   * @param y - The initial y-coordinate of the hero.
   * @param spriteSheetFilePath - Path to the sprite sheet image.
   */
  constructor(name: string, x: number, y: number, spriteSheetFilePath: string) {
    super(
      name,
      x,
      y,
      Hero.HERO_WIDTH,
      Hero.HERO_HEIGHT,
      spriteSheetFilePath,
      Hero.HERO_SPRITE_SHEET_TILE_WIDTH,
      Hero.HERO_SPRITE_SHEET_TILE_HEIGHT,
      Hero.HERO_ANIMATION_FRAMES,
      Hero.HERO_INACTIVE_FRAME_INDEX
    );
  }

  public async load() {
    await super.load();
    this.loadStats(0);
  }

  public draw(
    context: CanvasRenderingContext2D,
    cameraOffsetX: number,
    cameraOffsetY: number
  ): void {
    super.draw(context, cameraOffsetX, cameraOffsetY);

    // Draw the character's level
    context.fillStyle = "white";
    context.textAlign = "center";
    context.font = "14px Avenir";
    context.fillText(
      `Level ${this.level}`,
      this.x + cameraOffsetX,
      this.y - this.getHeight() + cameraOffsetY - 25
    );

    // Draw the character's name
    context.fillStyle = "white";
    context.textAlign = "center";
    context.font = "20px Avenir";
    context.fillText(
      this.name,
      this.x + cameraOffsetX,
      this.y - this.getHeight() + cameraOffsetY - 5
    );
  }

  public levelUp(): void {
    this.level++;
    this.experienceAtCurrentLevel = 0;
    this.experienceToNextLevel = getExperienceForLevel(this.level);
    this.statsPoints += getStatsPointsForLevel(this.level);
  }

  public getLevel(): number {
    return this.level;
  }

  public getExperience(): number {
    return this.experience;
  }

  public getExperienceAtCurrentLevel(): number {
    return this.experienceAtCurrentLevel;
  }

  public getExperienceToNextLevel(): number {
    return this.experienceToNextLevel;
  }

  public getGold(): number {
    return this.gold;
  }
}

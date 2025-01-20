import SpriteSheet from "../view/SpriteSheet";
import Config from "../config.json";

enum Direction {
  Down = "down",
  Left = "left",
  Right = "right",
  Up = "up",
}

interface AnimationFrames {
  down: number[];
  left: number[];
  right: number[];
  up: number[];
}

/**
 * The `Character` class represents a game character with position, size, and animation details.
 * It handles movement, rendering, and collision box calculations.
 */
export default class Character {
  private static readonly CHARACTER_MOVE_SPEED = 2;
  private static readonly CHARACTER_SPRITE_SHEET_COLUMNS = 3;
  private static readonly CHARACTER_ANIMATION_FRAMES = {
    down: [0, 1, 2],
    left: [3, 4, 5],
    right: [6, 7, 8],
    up: [9, 10, 11],
  };
  private static readonly CHARACTER_INACTIVE_FRAME_INDEX = 0; // Index of the inactive frame in a row of the sprite sheet.
  private static readonly CHARACTER_FRAME_INTERVAL = 100;

  protected spriteSheet: SpriteSheet;
  protected moveSpeed: number = Character.CHARACTER_MOVE_SPEED;
  protected walking: boolean = false;
  protected currentFrameIndex: number = 0;
  protected lastFrameTime: number = 0; // Temps de la dernière mise à jour en ms
  protected frameInterval: number = Character.CHARACTER_FRAME_INTERVAL; // Intervalle minimum entre frames en ms

  /**
   * Creates a new `Character` instance.
   * @param name - The name of the character.
   * @param x - The initial x-coordinate of the character.
   * @param y - The initial y-coordinate of the character.
   * @param width - The width of the character.
   * @param height - The height of the character.
   * @param spriteSheetFilePath - Path to the sprite sheet image.
   * @param spriteSheetTileWidth - Width of each tile in the sprite sheet.
   * @param spriteSheetTileHeight - Height of each tile in the sprite sheet.
   * @param animationFrames - Animation frames for the character.
   * @param idleFrameIndex - Index of the inactive frame in a row of the sprite sheet.
   * @param direction - The initial direction of the character.
   */
  constructor(
    protected name: string,
    protected x: number,
    protected y: number,
    protected width: number,
    protected height: number,
    protected spriteSheetFilePath: string,
    protected spriteSheetTileWidth: number,
    protected spriteSheetTileHeight: number,
    protected animationFrames: AnimationFrames = Character.CHARACTER_ANIMATION_FRAMES,
    protected idleFrameIndex = Character.CHARACTER_INACTIVE_FRAME_INDEX,
    protected direction = Direction.Down
  ) {
    if (
      !this.animationFrames["down"] ||
      !this.animationFrames["up"] ||
      !this.animationFrames["left"] ||
      !this.animationFrames["right"]
    ) {
      throw new Error(`Invalid animation frames for character ${this.name}.`);
    }

    let spritesheetColumn = this.animationFrames[direction].length;
    this.spriteSheet = new SpriteSheet(
      spriteSheetFilePath,
      spriteSheetTileWidth,
      spriteSheetTileHeight,
      spritesheetColumn * 4, // 4 directions
      spritesheetColumn
    );
  }

  /**
   * Loads the character's sprite sheet.
   */
  public async load() {
    await this.spriteSheet.load();
  }

  /**
   * Updates the character's animation frame.
   * Advances the current frame index if the character is walking and the frame interval has elapsed.
   */
  public updateFrame(currentTime: number) {
    if (this.walking) {
      // Vérifie si suffisamment de temps s'est écoulé depuis la dernière mise à jour
      if (currentTime - this.lastFrameTime >= this.frameInterval) {
        this.currentFrameIndex =
          (this.currentFrameIndex + 1) %
          Character.CHARACTER_SPRITE_SHEET_COLUMNS;
        this.lastFrameTime = currentTime; // Met à jour le dernier temps
      }
    } else {
      this.currentFrameIndex = this.idleFrameIndex;
    }
  }

  /**
   * Moves the character by the specified amounts in the x and y directions.
   * Updates the character's direction based on movement.
   * @param dx - Change in x-coordinate.
   * @param dy - Change in y-coordinate.
   */
  public move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;

    if (dx > 0) this.direction = Direction.Right;
    if (dx < 0) this.direction = Direction.Left;
    if (dy > 0) this.direction = Direction.Down;
    if (dy < 0) this.direction = Direction.Up;
  }

  /**
   * Draws the character on the canvas.
   * If debug mode is enabled, also renders the character's position and collision box.
   * @param context - The canvas rendering context.
   * @param cameraOffsetX - Horizontal offset for the camera.
   * @param cameraOffsetY - Vertical offset for the camera.
   */
  public draw(
    context: CanvasRenderingContext2D,
    cameraOffsetX: number,
    cameraOffsetY: number
  ) {
    // context.fillStyle = "red";
    // context.fillRect(
    //   this.x - this.width / 2 + cameraOffsetX,
    //   this.y - this.height + cameraOffsetY,
    //   this.width,
    //   this.height
    // );

    // Draw the character's current animation frame
    context.drawImage(
      this.getAnimationFrame(),
      this.x - this.width / 2 + cameraOffsetX,
      this.y - this.height + cameraOffsetY
    );

    if (Config.dev.debug) {
      this.drawCharacterPosition(context, cameraOffsetX, cameraOffsetY);
      this.drawBoxCollision(context, cameraOffsetX, cameraOffsetY);
    }
  }

  /**
   * Draws the character's position on the canvas.
   * @param context - The canvas rendering context.
   * @param cameraOffsetX - Horizontal offset of the camera.
   * @param cameraOffsetY - Vertical offset of the camera.
   */
  private drawCharacterPosition(
    context: CanvasRenderingContext2D,
    cameraOffsetX: number,
    cameraOffsetY: number
  ) {
    context.fillStyle = "yellow";
    context.fillRect(
      this.x + cameraOffsetX - 3,
      this.y + cameraOffsetY - 3,
      6,
      6
    );
    context.font = "12px Avenir";
    context.fillText(
      `(${this.x}, ${this.y})`,
      this.x + cameraOffsetX,
      this.y + cameraOffsetY + 15
    );
  }

  /**
   * Draws the character's collision box on the canvas.
   * @param context - The canvas rendering context.
   * @param cameraOffsetX - Horizontal offset of the camera.
   * @param cameraOffsetY - Vertical offset of the camera.
   */
  private drawBoxCollision(
    context: CanvasRenderingContext2D,
    cameraOffsetX: number,
    cameraOffsetY: number
  ) {
    const { left, right, top, bottom } = this.boxCollision();
    context.strokeStyle = "yellow";
    context.textAlign = "center";
    context.strokeRect(
      left + cameraOffsetX,
      top + cameraOffsetY,
      right - left,
      bottom - top
    );
  }

  /**
   * Calculates the character's collision box.
   * @returns An object containing the left, right, top, and bottom boundaries of the collision box.
   */
  public boxCollision() {
    const left = this.x - this.width / 2;
    const right = this.x + this.width / 2;
    const top = this.y - this.height / 3;
    const bottom = this.y;
    return { left, right, top, bottom };
  }

  /**
   * Gets the current animation frame for the character.
   * @returns The canvas element containing the current animation frame.
   */
  public getAnimationFrame() {
    const tileIndex =
      this.animationFrames[this.direction][this.currentFrameIndex];
    return this.spriteSheet.getTile(tileIndex);
  }

  /**
   * Gets the character's name.
   * @returns The name of the character.
   */
  public getName() {
    return this.name;
  }

  /**
   * Gets the character's x-coordinate.
   * @returns The x-coordinate of the character.
   */
  public getX() {
    return this.x;
  }

  /**
   * Gets the character's y-coordinate.
   * @returns The y-coordinate of the character.
   */
  public getY() {
    return this.y;
  }

  /**
   * Gets the character's width.
   * @returns The width of the character.
   */
  public getWidth() {
    return this.width;
  }

  /**
   * Gets the character's height.
   * @returns The height of the character.
   */
  public getHeight() {
    return this.height;
  }

  /**
   * Gets the character's sprite sheet.
   * @returns The `SpriteSheet` instance associated with the character.
   */
  public getSpriteSheet() {
    return this.spriteSheet;
  }

  /**
   * Gets the character's current direction.
   * @returns The direction the character is facing.
   */
  public getDirection() {
    return this.direction;
  }

  /**
   * Sets the character's name.
   * @param name - The new name for the character.
   */
  public setName(name: string) {
    this.name = name;
  }

  /**
   * Sets the character's direction.
   * @param direction - The new direction for the character.
   */
  public setDirection(direction: Direction) {
    this.direction = direction;
  }

  /**
   * Sets the character's walking state.
   * @param walking - Whether the character is walking.
   */
  public setWalking(walking: boolean) {
    this.walking = walking;
  }

  /**
   * Checks if the character is walking.
   * @returns True if the character is walking, otherwise false.
   */
  public isWalking() {
    return this.walking;
  }

  /**
   * Gets the character's movement speed.
   * @returns The movement speed of the character.
   */
  public getMoveSpeed() {
    return this.moveSpeed;
  }

  /**
   * Sets the character's movement speed.
   * @param moveSpeed - The new movement speed for the character.
   */
  public setMoveSpeed(moveSpeed: number) {
    this.moveSpeed = moveSpeed;
  }
}

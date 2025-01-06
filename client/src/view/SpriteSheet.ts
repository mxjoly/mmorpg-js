import Config from "../config.json";

class SpriteSheet {
  private image: HTMLImageElement | null = null; // The sprite sheet image
  private filePath: string | null = null; // File path to the sprite sheet image
  private tileWidth: number = 0; // Dimensions of each tile in the sprite sheet
  private tileHeight: number = 0; // Dimensions of each tile in the sprite sheet
  private tileCount: number = 0; // Total number of tiles in the sprite sheet
  private columns: number = 0; // Number of columns in the sprite sheet

  /**
   * Creates a new SpriteSheet instance.
   * @param filePath The file path to the sprite sheet image.
   */
  constructor(
    filePath: string,
    tileWidth: number,
    tileHeight: number,
    tileCount: number,
    columns: number
  ) {
    this.filePath = filePath;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tileCount = tileCount;
    this.columns = columns;
  }

  /**
   * Loads the sprite sheet image from the file path.
   */
  async load(): Promise<void> {
    if (this.image || !this.filePath) return;

    const image = new Image();
    image.src = this.filePath;

    try {
      await image.decode();
      this.image = image;

      if (Config.dev.debug) {
        console.log(`Loaded spritesheet image at ${this.filePath}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to load spritesheet image at ${this.filePath}: ${error}`
      );
    }
  }

  /**
   * Retrieves the total number of tiles in the sprite sheet.
   */
  getTileCount(): number {
    return this.tileCount;
  }

  /**
   * Retrieves the coordinates of a tile in the sprite sheet.
   * @param tileIndex The index of the tile (0-based).
   * @returns An object containing the x and y coordinates.
   */
  getTileCoordinates(tileIndex: number): { x: number; y: number } {
    if (!this.image) {
      throw new Error(`Sprite sheet ${this.filePath} is not loaded.`);
    }

    const x = (tileIndex % this.columns) * this.tileWidth;
    const y = Math.floor(tileIndex / this.columns) * this.tileHeight;

    return { x, y };
  }

  /**
   * Retrieves a tile as a canvas element.
   * @param tileIndex The index of the tile (0-based).
   * @returns A canvas containing the requested tile.
   */
  getTile(tileIndex: number): HTMLCanvasElement {
    const { x, y } = this.getTileCoordinates(tileIndex);

    const canvas = document.createElement("canvas");
    canvas.width = this.tileWidth;
    canvas.height = this.tileHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Failed to get 2D context from canvas.");
    }

    if (this.image) {
      context.drawImage(
        this.image,
        x,
        y,
        this.tileWidth,
        this.tileHeight,
        0,
        0,
        this.tileWidth,
        this.tileHeight
      );
    }

    return canvas;
  }

  /**
   * Draws a tile onto a given canvas context.
   * @param context The canvas 2D context to draw on.
   * @param tileIndex The index of the tile (0-based).
   * @param destX The x-coordinate to draw the tile at.
   * @param destY The y-coordinate to draw the tile at.
   */
  drawTile(
    context: CanvasRenderingContext2D,
    tileIndex: number,
    destX: number,
    destY: number
  ): void {
    const { x, y } = this.getTileCoordinates(tileIndex);

    if (!this.image) {
      throw new Error(`Sprite sheet ${this.filePath} is not loaded.`);
    }

    context.drawImage(
      this.image,
      x,
      y,
      this.tileWidth,
      this.tileHeight,
      destX,
      destY,
      this.tileWidth,
      this.tileHeight
    );
  }

  /**
   * Checks whether the sprite sheet image has been loaded.
   * @returns Whether the sprite sheet image has been loaded.
   */
  isLoaded(): boolean {
    return this.image !== null;
  }
  public getTileWidth(): number {
    return this.tileWidth;
  }

  public getTileHeight(): number {
    return this.tileHeight;
  }

  public getColumns(): number {
    return this.columns;
  }

  public getFilePath(): string {
    return this.filePath || "";
  }
}

export default SpriteSheet;
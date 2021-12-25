// locationVector: x, y, 0
// blockVector: x, y, z
// top left corner of map is 0, 0, 0. A coordinate is a corner of a rectangle on the grid.
// If the map for example is [[0, 0], [0, 1]] then that means that the coordinate (x: 1, y: 1) ...
// is the center of the map consisting of four squares. The 1 here signals that from this coordinate
// we have a path square that goes from (x: 1, y: 1) to (x: 2, y: 2).
// We can calculate the four corners of the square that is in the path by adding (0,0), (0,1), (1,0), and (1,1)
// respectively as vectors.

class Node {
  constructor(position, blockVector) {
    this.position = position;
    this.blockVector = blockVector;
  }

  isSameAs(otherNode) {
    return (
      JSON.stringify(this.position) === JSON.stringify(otherNode.position) &&
      JSON.stringify(this.blockVector) === JSON.stringify(otherNode.blockVector)
    );
  }
}

class Block {
  constructor(position, map) {
    this.position = position;
    this.blockVector = [1, 1, 2];
    this.map = map;
  }

  /** direction is [x, y]
   */
  calculateMove(direction) {
    const newPosition = [
      this.blockVector[0] * direction[0] + this.position[0],
      this.blockVector[1] * direction[1] + this.position[1],
      0,
    ];
    let newVector = [];
    if (direction[0] !== 0)
      newVector = [
        this.blockVector[2],
        this.blockVector[1],
        this.blockVector[0],
      ];
    if (direction[1] !== 0)
      newVector = [
        this.blockVector[0],
        this.blockVector[2],
        this.blockVector[1],
      ];

    return { newPosition, newVector };
  }

  getField([x, y]) {
    return parseInt(this.map[y][x]) || this.map[y][x];
  }

  /** to check whether a movement is possible, for the relevant axis check block vector length (1 or 2 fields)
   * on that axis, and then check the next 1 or 2 fields in the given direction (whether there is a path - a 1 in
   * given map fields)
   */
  isMovementPossible(movement) {
    const { newPosition, newVector } = movement;
    const newFieldFree = this.getField(newPosition) === 1;
    if (!newFieldFree) return false;

    if (newVector[0] === 2) return true;

    let nextBlockField;

    if (newVector[2] === 2) {
      nextBlockField = [newPosition[0] + 1, newPosition[1]];
    }
    if (newVector[1] === 2) {
      nextBlockField = [newPosition[0] + 1, newPosition[1] + 1];
    }

    return this.getField(nextBlockField) === 1;
  }

  move(direction) {
    const movement = this.calculateMove(direction);
    if (isMovementPossible(movement)) {
      const { newPosition, newVector } = movement;
      this.position = newPosition;
      this.blockVector = newVector;
      return true;
    } else {
      return false;
    }
  }
}

function getInitialPositions(arr) {
  let blockPosition;
  let targetPosition;

  arr.forEach((row, rowIndex) => {
    const indexB = row.indexOf('B');
    const indexX = row.indexOf('X');
    if (indexB >= 0) {
      blockPosition = [indexB, rowIndex, 0];
    }
    if (indexX >= 0) {
      targetPosition = [indexX, rowIndex, 0];
    }
  });

  return { blockPosition, targetPosition };
}

function bloxSolver(arr) {
  const { blockPosition, targetPosition } = getInitialPositions(arr);
  const block = new Block(blockPosition, arr);
  block.position = blockPosition;
}

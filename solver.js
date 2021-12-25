// locationVector: x, y, 0
// blockVector: x, y, z
// top left corner of map is 0, 0, 0. A coordinate is a corner of a rectangle on the grid.
// If the map for example is [[0, 0], [0, 1]] then that means that the coordinate (x: 1, y: 1) ...
// is the center of the map consisting of four squares. The 1 here signals that from this coordinate
// we have a path square that goes from (x: 1, y: 1) to (x: 2, y: 2).
// We can calculate the four corners of the square that is in the path by adding (0,0), (0,1), (1,0), and (1,1)
// respectively as vectors.

/** direction is [x, y]
 */
function calculateMove(direction, previousNode) {
  const { position, blockVector } = previousNode;
  let newPosition = [];

  if (position[0] >= 0 && position[1] >= 0) {
    newPosition = [direction[0] + position[0], direction[1] + position[1]];
  } else {
    newPosition = [
      position[2] * direction[0] + position[0],
      position[2] * direction[2] + position[1],
    ];
  }

  let newVector = [];
  if (direction[0] !== 0)
    newVector = [blockVector[2], blockVector[1], blockVector[0]];
  if (direction[1] !== 0)
    newVector = [blockVector[0], blockVector[2], blockVector[1]];

  return new Node(newPosition, newVector);
}

function getField(map, [x, y]) {
  return parseInt(map[y][x]) || map[y][x];
}

/** to check whether a movement is possible, for the relevant axis check block vector length (1 or 2 fields)
 * on that axis, and then check the next 1 or 2 fields in the given direction (whether there is a path - a 1 in
 * given map fields)
 */
function isMovementPossible(map, newNode) {
  const { position, blockVector } = newNode;
  const newFieldFree = getField(map, position) === 1;

  if (!newFieldFree) return false;

  if (blockVector[0] === 2) return true;

  let nextBlockField;

  if (blockVector[2] === 2) {
    nextBlockField = [position[0] + 1, position[1]];
  }
  if (blockVector[1] === 2) {
    nextBlockField = [position[0], position[1] + 1];
  }

  return getField(map, nextBlockField) === 1;
}

class Node {
  constructor(position, blockVector) {
    this.position = position;
    this.blockVector = blockVector;
    this.isSameAs.bind(this);
    this.neighbors.bind(this);
  }

  isSameAs(otherNode) {
    return (
      JSON.stringify(this.position) === JSON.stringify(otherNode.position) &&
      JSON.stringify(this.blockVector) === JSON.stringify(otherNode.blockVector)
    );
  }

  neighbors(map) {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    const res = directions.map((dir) => {
      const nextNode = calculateMove(dir, this);
      const available = isMovementPossible(map, nextNode);
      console.log(nextNode);
      console.log(available);
      if (available) {
        return nextNode;
      } else {
        return false;
      }
    });

    return res.filter((dir) => dir);
  }
}

class Block extends Node {
  constructor(position, map) {
    const blockVector = [1, 1, 2];
    super(position, blockVector);
    this.map = map;
    this.move.bind(this);
  }

  move(direction) {
    const nextNode = calculateMove(direction, this);
    if (isMovementPossible(map, nextNode)) {
      const { newPosition, newVector } = nextNode;
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

/* -------------- Tests -------------- */

describe('Tests', () => {
  const fixedTests = [
    [
      '1110000000',
      '1B11110000',
      '1111111110',
      '0111111111',
      '0000011X11',
      '0000001110',
    ],
    [
      '000000111111100',
      '111100111001100',
      '111111111001111',
      '1B11000000011X1',
      '111100000001111',
      '000000000000111',
    ],
    [
      '00011111110000',
      '00011111110000',
      '11110000011100',
      '11100000001100',
      '11100000001100',
      '1B100111111111',
      '11100111111111',
      '000001X1001111',
      '00000111001111',
    ],
    [
      '11111100000',
      '1B111100000',
      '11110111100',
      '11100111110',
      '10000001111',
      '11110000111',
      '11110000111',
      '00110111111',
      '01111111111',
      '0110011X100',
      '01100011100',
    ],
    [
      '000001111110000',
      '000001001110000',
      '000001001111100',
      'B11111000001111',
      '0000111000011X1',
      '000011100000111',
      '000000100110000',
      '000000111110000',
      '000000111110000',
      '000000011100000',
    ],
  ];
  /*it("test", () => {
    const fixedSols = ['RRDRRRD',
				   'ULDRURRRRUURRRDDDRU',
				   'ULURRURRRRRRDRDDDDDRULLLLLLD',
				   'DRURURDDRRDDDLD',
				   'RRRDRDDRDDRULLLUULUUURRRDDLURRDRDDR'];

    fixedTests.forEach((e,i) => verifySolution(e,bloxSolver(e.slice()),fixedSols[i],));
  });*/
  it('creates Block', () => {
    const block = new Block([1, 1], fixedTests[0]);
    Test.assertDeepEquals(block.position, [1, 1]);
  });
  it('checks possibility of moving block to the right', () => {
    const block = new Block([1, 1], fixedTests[0]);
    const nextNode = calculateMove([1, 0], block);

    Test.assertEquals(isMovementPossible(fixedTests[0], nextNode), true);
  });
  it('moves vertically lying block to the right', () => {
    const block = new Block([1, 1], fixedTests[0]);

    block.blockVector = [1, 2, 1];
    const { position, blockVector } = calculateMove([1, 0], block);
    Test.assertDeepEquals(position, [2, 1]);
    Test.assertDeepEquals(blockVector, [1, 2, 1]);
  });
  it('checks movement possible for vertical block', () => {
    const block = new Block([1, 1], fixedTests[0]);
    block.blockVector = [1, 2, 1];

    const secondNode = calculateMove([1, 0], block);
    Test.assertEquals(isMovementPossible(fixedTests[0], secondNode), true);
    console.log('ok');

    block.position = [2, 0, 0];
    const thirdNode = calculateMove([1, 0], block);

    console.log('ok 2');
    Test.assertEquals(isMovementPossible(fixedTests[0], thirdNode), false);
  });
  it('checks whether two nodes match', () => {
    const node1 = new Node([1, 0, 0], [1, 2, 1]);
    const node2 = new Node([1, 0, 0], [1, 2, 1]);

    Test.assertNotEquals(node1, node2);
    Test.assertEquals(node1.isSameAs(node2), true);
  });
  it('gets field', () => {
    const map = fixedTests[0];
    Test.assertEquals(getField(map, [1, 1]), 'B');
    Test.assertEquals(getField(map, [1, 2]), 1);
  });
  it('gets neighbors for node', () => {
    const block = new Block([1, 1], fixedTests[0]);

    Test.assertDeepEquals(block.neighbors(fixedTests[0]), [
      new Node([2, 1], [2, 1, 1]),
      new Node([1, 2], [1, 2, 1]),
    ]);
  });
});

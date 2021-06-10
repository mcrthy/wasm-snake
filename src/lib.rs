mod utils;

use wasm_bindgen::prelude::*;
use rand::Rng;
use std::collections::VecDeque;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Off = 0,
    On = 1,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq)]
pub enum Direction {
    Up,
    Down,
    Right,
    Left,
}

#[wasm_bindgen]
pub struct Game {
    width: u32,
    height: u32,
    snake: VecDeque<(u32,u32)>,
    food: (u32, u32),
    direction: Direction,
    cells: Vec<Cell>,
}

impl Game {
    fn get_index(&self, col: u32, row: u32) -> usize {
        (row * self.width + col) as usize
    }
}

impl Direction {
    fn is_opposite(&self, direction: Direction) -> bool {
        match (self, direction) {
            (Direction::Up, Direction::Down) => true,
            (Direction::Down, Direction::Up) => true,
            (Direction::Right, Direction::Left) => true,
            (Direction::Left, Direction::Right) => true,
            (_, _) => false
        }
    }
}

#[wasm_bindgen]
impl Game {
    
    pub fn tick(&mut self, direction: Direction) {

        let mut next = self.cells.clone();

        let snake_head = self.snake.get(0).unwrap().clone();

        if snake_head == self.food {
            self.food = (
                rand::thread_rng().gen_range(0..64),
                rand::thread_rng().gen_range(0..64),
            );

            let food_index = self.get_index(self.food.0, self.food.1);

            next[food_index] = Cell::On;
        } else {
            let snake_tail = self.snake.pop_back().unwrap();
            let snake_tail_index = self.get_index(snake_tail.0, snake_tail.1);
            next[snake_tail_index] = Cell::Off;
        }
        
        if self.snake.len() == 1 || !self.direction.is_opposite(direction) {
            self.direction = direction;
        }

        let new_snake_head = match self.direction {
            Direction::Up => (
                snake_head.0,
                (snake_head.1 - 1) % self.height,
            ),
            Direction::Down => (
                snake_head.0,
                (snake_head.1 + 1) % self.height,
            ),
            Direction::Right => (
                (snake_head.0 + 1) % self.width,
                snake_head.1,
            ),
            Direction::Left => (
                (snake_head.0 - 1) % self.width,
                snake_head.1,
            ),
        };

        let new_snake_head_index = self.get_index(new_snake_head.0, new_snake_head.1);

        next[new_snake_head_index] = Cell::On;

        self.snake.push_front(new_snake_head);

        self.cells = next;
    }

    pub fn new() -> Game {
        let width: u32 = 64;
        let height: u32 = 64;

        let mut snake = VecDeque::new();

        snake.push_back((
            (width - 1) / 2,
            (height - 1) / 2,
        ));
        
        let food = (
            10,
            10,
        );

        let cells = (0..width * height)
            .map(|i| {
                if i == (snake.get(0).unwrap().1 * width + snake.get(0).unwrap().0) 
                || i == (food.1 * width + food.0) {
                    Cell::On
                } else {
                    Cell::Off
                }
            })
            .collect();

        Game {
            width,
            height,
            snake,
            food,
            direction: Direction::Up,
            cells,
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn direction(&self) -> Direction {
        self.direction
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }
}
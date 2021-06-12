mod utils;

use wasm_bindgen::prelude::*;
use rand::Rng;
use std::collections::VecDeque;
use indexmap::IndexSet;
use itertools::Itertools;


extern crate web_sys;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

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
    points: IndexSet<(u32, u32)>,
}

impl Game {
    fn get_index(&self, col: u32, row: u32) -> usize {
        (row * self.width + col) as usize
    }

    fn process_food(&mut self) {
        let excluded_points:IndexSet<(u32, u32)> = self.snake.iter()
        .map( |(x,y)| {
            (*x, *y)
        }).collect();

        let possible_points:IndexSet<(u32, u32)> = self.points.difference(&excluded_points).cloned().collect();

        let valid_food_location = rand::thread_rng().gen_range(0..possible_points.len());
        self.food = possible_points[valid_food_location];

        let food_index = self.get_index(self.food.0, self.food.1);
        self.cells[food_index] = Cell::On;
    }

    fn move_snake_tail(&mut self) {
        let snake_tail = self.snake.pop_back().unwrap();
        let snake_tail_index = self.get_index(snake_tail.0, snake_tail.1);
        self.cells[snake_tail_index] = Cell::Off;
    }

    fn move_snake_head(&mut self) {
        let snake_head = self.snake.get(0).unwrap();

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
        self.cells[new_snake_head_index] = Cell::On;
        self.snake.push_front(new_snake_head);
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
        if self.snake.len() == 1 || !self.direction.is_opposite(direction) {
            self.direction = direction;
        }

        self.move_snake_head();

        let old_snake_head = self.snake.get(1).unwrap();

        if *old_snake_head != self.food {
            self.move_snake_tail();
        } else {
            self.process_food();
        }
    }

    pub fn is_over(&self) -> bool {
        if self.snake.len() <= 4 {
            return false;
        }

        let hittable_segment:Vec<&(u32, u32)> = self.snake.range(4..).collect();
        let head = self.snake.get(0).unwrap();

        hittable_segment.contains(&head)
    }

    pub fn new(width: u32, height: u32, direction: Direction) -> Game {
        utils::set_panic_hook();

        let snake_starting_point = (
            (width - 1) / 2,
            (height - 1) / 2,
        );
        
        let food = (
            rand::thread_rng().gen_range(0..width),
            rand::thread_rng().gen_range(0..height),
        );

        let cells = (0..width * height)
            .map(|i| {
                if i == (snake_starting_point.1 * width + snake_starting_point.0) 
                || i == (food.1 * width + food.0) {
                    Cell::On
                } else {
                    Cell::Off
                }
            })
            .collect();
        
        let points:IndexSet<(u32, u32)> = (0..width).cartesian_product(0..height).collect();
        
        let mut snake = VecDeque::new();
        snake.push_back(snake_starting_point);

        Game {
            width,
            height,
            snake,
            food,
            direction,
            cells,
            points,
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
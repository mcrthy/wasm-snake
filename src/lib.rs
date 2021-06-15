mod utils;

use wasm_bindgen::prelude::*;
use rand::Rng;
use std::collections::VecDeque;
use indexmap::IndexSet;
use itertools::Itertools;


extern crate web_sys;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
// NOTE: Repeatedly logging from Rust to the browser console will significantly slow the app down.
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
#[derive(Clone, Copy, PartialEq)]
pub enum Direction {
    Up,
    Down,
    Right,
    Left,
}

#[wasm_bindgen]
pub struct Game {
    width: u8,
    height: u8,
    points: IndexSet<(u8, u8)>,
    snake: VecDeque<(u8, u8)>,
    food: (u8, u8),
    direction: Direction,
}

impl Game {
    fn process_food(&mut self) {
        let excluded_points:IndexSet<(u8, u8)> = self.snake.iter()
        .map( |(x,y)| {
            (*x, *y)
        }).collect();

        let possible_points:IndexSet<(u8, u8)> = self.points.difference(&excluded_points).cloned().collect();

        let random_idx = rand::thread_rng().gen_range(0..possible_points.len());
        self.food = possible_points[random_idx];
    }

    fn move_snake_head(&mut self) {
        let snake_head = self.snake.get(0).unwrap().clone();

        self.snake.push_front(match self.direction {
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
        });
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
            self.snake.pop_back();
        } else {
            self.process_food();
        }
    }

    pub fn is_over(&self) -> bool {
        if self.snake.len() <= 4 {
            return false;
        }

        let hittable_segment:Vec<&(u8, u8)> = self.snake.range(4..).collect();
        let head = self.snake.get(0).unwrap();

        hittable_segment.contains(&head)
    }

    pub fn is_occupied(&self, row: u8, col: u8) -> bool {
        let point = (col, row);
        self.snake.contains(&point) || self.food == point
    }

    pub fn new(width: u8, height: u8, direction: Direction) -> Game {
        utils::set_panic_hook();

        let points:IndexSet<(u8, u8)> = (0..width).cartesian_product(0..height).collect();

        let mut snake = VecDeque::new();
        snake.push_back((
            (width - 1) / 2,
            (height - 1) / 2,
        ));
        
        let food = (
            rand::thread_rng().gen_range(0..width),
            rand::thread_rng().gen_range(0..height),
        );

        Game {
            width,
            height,
            points,
            snake,
            food,
            direction,
        }
    }

    pub fn width(&self) -> u8 {
        self.width
    }

    pub fn height(&self) -> u8 {
        self.height
    }

    pub fn direction(&self) -> Direction {
        self.direction
    }
}
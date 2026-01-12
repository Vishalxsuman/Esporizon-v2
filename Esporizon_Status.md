# Esporizon System Status & Documentation

## Overview
This document outlines the current working routes, known issues, and configuration details for the Esporizon platform.

## Current Working Routes

### Backend API (`/api`)

#### Prediction Endpoints (`/api/predict`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/init` | Initialize prediction system (counters, etc.) | No |
| GET | `/current-round` | Get current round info (optional `mode` query param) | No |
| POST | `/place-bet` | Place a bet on the current round | Yes |
| GET | `/history` | Get prediction history (latest 20) | No |
| GET | `/my-bets` | Get authenticated user's bet history | Yes |
| GET | `/chart/:gameMode` | Get statistical chart data for a game mode | No |
| POST | `/guest/create` | Create a guest wallet | No |
| GET | `/balance` | Get user or guest wallet balance | Yes/Conditional |
| POST | `/wallet/deposit` | Add funds (Dev/Test endpoint: defaults to +500) | Yes |

#### Wallet Endpoints (`/api/wallet`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/add` | Add funds to wallet (Admin/User self-add) | Yes |
| POST | `/deduct` | Deduct funds from wallet | Yes |
| POST | `/withdraw` | Submit withdrawal request | Yes |
| GET | `/balance` | Get current user's balance | Yes |

#### Tournament Endpoints (`/api/tournaments`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List tournaments (filter by `gameId`, `status`) | No |
| GET | `/:id` | Get specific tournament details | No |
| POST | `/create` | Create a new tournament | Yes |
| POST | `/:id/join` | Join a tournament (deducts entry fee) | Yes |
| POST | `/:id/leave` | Leave a tournament (refunds fee if before deadline) | Yes |
| GET | `/:id/participants` | Get list of participants | No |

#### Posts/Social Endpoints (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get recent posts | No |
| GET | `/:id` | Get specific post | No |
| POST | `/:id/like` | Like/Unlike a post | Yes |
| POST | `/:id/comment` | Add a comment to a post | Yes |
| POST | `/:id/share` | Share a post | Yes |
| POST | `/create` | Create a new post | Yes |

## Current Issues & Observations
1.  **Dashboard Performance**: Users report slow loading times. Potential causes include heavy visual effects (`ParticlesBackground`) or initial data fetching latency.
2.  **SSH/Server Connectivity**: User reported issues connecting to the server.
    - **Recommended SSH Command**: `ssh -i "c:\Users\visha\Downloads\LightsailDefaultKey-ap-south-1.pem" ubuntu@65.2.33.69`
3.  **Environment Variables**:
    - `.env` files located at project root and potentially server root.
    - User reported `.env` in `utils`, but this could not be verified in the standard `src/utils` or `server/utils` paths.

## Deployment Status
- **Backend**: Running on AWS Lightsail (`65.2.33.69:5000`).
- **Frontend**: Local development or deployed via Firebase (check `.firebaserc`).


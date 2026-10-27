# IELTS Testing — Front End

A Next.js web app for practising the **IELTS Writing** test. Candidates pick the exam type and task, get a writing prompt (or upload their own), write or upload their answer, and receive an automated evaluation with a downloadable PDF report.

It is the front end for the IELTS Testing API (`backend.ielts-testing.com`).

## How it works

1. **Access code** — users enter a session access code (`/code`) before they can log in.
2. **Register / log in** — accounts are handled by the back end; JWT access and refresh tokens are stored in cookies and refreshed automatically when they expire.
3. **Choose a test** (`/`) — select the exam type (Academic or General Training), task number (Task 1 or Task 2) and whether to use a generated question or your own.
4. **Write** (`/writing`, `/test`) — fetch the task prompt (including Task 1 charts/images), then type the answer or upload it as a file.
5. **Results** — the answer is submitted for evaluation and the results are shown on screen along with a PDF report.
6. **Upload a question** (`/upload-ques`) — practise with a question you supply yourself.

## Tech stack

- Next.js 15 (Pages Router), React 19
- Redux Toolkit (auth state) + React Context (exam state)
- Axios with request/response interceptors for auth and token refresh
- Tailwind CSS
- js-cookie

## Project structure

```
pages/           Routes: index, login, register, code, test, writing, upload-ques
context/         ExamContext — exam type, task number, question choice, results
store/           Redux store and auth slice
utils/           Axios instance (base URL + token handling), token check helper
styles/, app/    Global styles
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The API base URL is configured in [`utils/axiosConfig.js`](utils/axiosConfig.js); change it to point at your own back end. The token-refresh call in the same file currently targets a local back end (`127.0.0.1:8000`).

### Other scripts

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint
```

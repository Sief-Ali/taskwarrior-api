import { Router } from 'express';
import { tasksController } from './tasks.controller.js';
import { rateLimiter } from '@middleware/rateLimiter.js';

const router = Router();


/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get tasks list
 *     description: Retrieves the list of tasks.
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Success response.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   description:
 *                     type: string
 *                     example: upload taskwarrior adapter
 *                   entry:
 *                     type: string
 *                     description: Task creation time in Taskwarrior UTC timestamp format.
 *                     pattern: '^\d{8}T\d{6}Z$'
 *                     example: 20261021T225143Z
 *                   modified:
 *                     type: string
 *                     description: Last modification time in Taskwarrior UTC timestamp format.
 *                     pattern: '^\d{8}T\d{6}Z$'
 *                     example: 20261021T225143Z
 *                   project:
 *                     type: string
 *                     example: TaskWarriorAdapter
 *                   status:
 *                     type: string
 *                     example: pending
 *                   uuid:
 *                     type: string
 *                     format: uuid
 *                     example: 1ad3ddbd-acde-4f06-80ce-2672c88e72c2
 *                   urgency:
 *                     type: number
 *                     example: 1
 *       400:
 *         description: Invalid task UUID.
 *       502:
 *         description: Taskwarrior failed or returned invalid output.
 *       503:
 *         description: Taskwarrior is not installed or unavailable.
 *       504:
 *         description: Taskwarrior command timed out.
 */
router.get('/', rateLimiter(30, 60000), (req, res, next) => tasksController.getTasksList(req, res, next));

/**
 * @swagger
 * /tasks/{uuid}:
 *   get:
 *     summary: Get task by UUID
 *     description: Retrieves a task by its UUID.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: 1ad3ddbd-acde-4f06-80ce-2672c88e72c2
 *     responses:
 *       200:
 *         description: Success response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 id: 1
 *                 description: upload taskwarrior adapter
 *                 entry: 20261021T225143Z
 *                 modified: 20261021T225143Z
 *                 project: TaskWarriorAdapter
 *                 status: pending
 *                 uuid: 1ad3ddbd-acde-4f06-80ce-2672c88e72c2
 *                 urgency: 1
 *       404:
 *         description: Task not found
 *       400:
 *         description: Invalid task UUID.
 *       502:
 *         description: Taskwarrior failed or returned invalid output.
 *       503:
 *         description: Taskwarrior is not installed or unavailable.
 *       504:
 *         description: Taskwarrior command timed out.
 */
router.get<{ uuid: string }>('/:uuid', rateLimiter(30, 60000), (req, res, next) => tasksController.getTaskById(req, res, next));

export const tasksRouter: Router = router;
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
 * /tasks:
 *   post:
 *     summary: Create a task
 *     description: Creates a task in the configured Taskwarrior data. This write endpoint has no API authentication; restrict access at the network or deployment boundary.
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [description]
 *             properties:
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 4096
 *                 example: Buy bread and milk
 *               project:
 *                 type: string
 *                 maxLength: 256
 *                 example: Home
 *               priority:
 *                 type: string
 *                 enum: [H, M, L]
 *               due:
 *                 type: string
 *                 maxLength: 128
 *                 example: tomorrow
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 256
 *                 example: [errands]
 *     responses:
 *       204:
 *         description: Task created. No task representation is returned.
 *       400:
 *         description: The request contains invalid task input.
 *       502:
 *         description: Taskwarrior failed or returned invalid output.
 *       503:
 *         description: Taskwarrior is not installed or unavailable.
 *       504:
 *         description: Taskwarrior command timed out.
 */
router.post('/', rateLimiter(30, 60000), (req, res, next) => tasksController.createTask(req, res, next));

/**
 * @swagger
 * /tasks/{uuid}:
 *   patch:
 *     summary: Modify a task
 *     description: Changes only the supplied fields on one task. This write endpoint has no API authentication; restrict access at the network or deployment boundary.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 4096
 *               project:
 *                 type: string
 *                 maxLength: 256
 *               priority:
 *                 type: string
 *                 enum: [H, M, L]
 *               due:
 *                 type: string
 *                 maxLength: 128
 *               addTags:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *               removeTags:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *     responses:
 *       204:
 *         description: Task modified.
 *       400:
 *         description: The UUID or request input is invalid.
 *       404:
 *         description: Task not found.
 *       502:
 *         description: Taskwarrior failed or returned invalid output.
 *       503:
 *         description: Taskwarrior is not installed or unavailable.
 *       504:
 *         description: Taskwarrior command timed out.
 */
router.patch<{ uuid: string }>('/:uuid', rateLimiter(30, 60000), (req, res, next) => tasksController.modifyTask(req, res, next));

/**
 * @swagger
 * /tasks/{uuid}/complete:
 *   post:
 *     summary: Complete a task
 *     description: Marks the task completed. This write endpoint has no API authentication; restrict access at the network or deployment boundary.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Task completed.
 *       400:
 *         description: The UUID is invalid.
 *       404:
 *         description: Task not found.
 *       502:
 *         description: Taskwarrior failed.
 *       503:
 *         description: Taskwarrior is not installed or unavailable.
 *       504:
 *         description: Taskwarrior command timed out.
 */
router.post<{ uuid: string }>('/:uuid/complete', rateLimiter(30, 60000), (req, res, next) => tasksController.completeTask(req, res, next));

/**
 * @swagger
 * /tasks/{uuid}:
 *   delete:
 *     summary: Soft-delete a task
 *     description: Marks a task deleted without purging it. This write endpoint has no API authentication; restrict access at the network or deployment boundary.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Task marked deleted.
 *       400:
 *         description: The UUID is invalid.
 *       404:
 *         description: Task not found.
 *       502:
 *         description: Taskwarrior failed.
 *       503:
 *         description: Taskwarrior is not installed or unavailable.
 *       504:
 *         description: Taskwarrior command timed out.
 */
router.delete<{ uuid: string }>('/:uuid', rateLimiter(30, 60000), (req, res, next) => tasksController.deleteTask(req, res, next));

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
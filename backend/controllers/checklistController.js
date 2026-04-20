/**
 * ------------------------------------------------------------
 * File: checklistController.js
 * Author: Nuno Oliveira
 * Date: 2026-04-20
 * Version: 1.0
 * 
 * Description:
 * Controller responsável por gerir as operações relacionadas
 * com as checklists. Recebe os pedidos HTTP das routes e delega
 * a lógica de negócio ao service.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const checklistService = require('../services/checklistService.js');


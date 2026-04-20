"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvidersForAuthLearner = getProvidersForAuthLearner;
const db_setup_1 = require("../db-setup");
/** Eligibility rows keyed by `auth_accounts` learner id (Workforce Cliff sign-in). */
function getProvidersForAuthLearner(learnerAccountId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_setup_1.db.all(`SELECT p.id, p.name, pi.integration_type, pi.is_enabled, pi.redirect_url, les.status
     FROM providers p
     LEFT JOIN provider_integrations pi ON p.id = pi.provider_id
     LEFT JOIN learner_eligibility_submissions les
       ON les.provider_id = p.id AND les.learner_account_id = ?`, learnerAccountId);
        return result;
    });
}

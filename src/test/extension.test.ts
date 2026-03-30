import * as assert from 'assert';

import * as vscode from 'vscode';
import { buildCopilotInstructions } from '../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Running Commit Contract tests.');

	test('registers setup command', async () => {
		const extension = vscode.extensions.getExtension('satvikvirmani.commit-contract');
		assert.ok(extension);
		await extension?.activate();

		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('commit-style.setup'));
		assert.ok(commands.includes('commit-style.setCustomInstruction'));
	});

	test('buildCopilotInstructions includes base rules only when custom text is empty', () => {
		const instructions = buildCopilotInstructions('   ');
		assert.strictEqual(instructions.length, 2);
		assert.deepStrictEqual(instructions[0], { file: '.copilot-commit-message-instructions.md' });
		assert.deepStrictEqual(instructions[1], {
			text: 'You MUST strictly follow the Conventional Commits specification.'
		});
	});

	test('buildCopilotInstructions appends custom instruction text', () => {
		const instructions = buildCopilotInstructions('Use Jira ticket IDs in subject.');
		assert.strictEqual(instructions.length, 3);
		assert.deepStrictEqual(instructions[2], {
			text: 'Use Jira ticket IDs in subject.'
		});
	});
});

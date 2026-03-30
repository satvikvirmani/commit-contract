import * as vscode from 'vscode';
import * as path from 'path';

const SETUP_COMMAND = 'commit-style.setup';
const SET_CUSTOM_INSTRUCTION_COMMAND = 'commit-style.setCustomInstruction';
const INSTRUCTIONS_FILE = '.copilot-commit-message-instructions.md';
const STRICT_CONVENTIONAL_TEXT = 'You MUST strictly follow the Conventional Commits specification.';
const WORKSPACE_STATE_AUTO_SETUP_KEY = 'commitStyle.autoSetupCompleted.v1';
const CONFIG_SECTION = 'commitStyle';
const COPILOT_INSTRUCTION_SETTING = 'github.copilot.chat.commitMessageGeneration.instructions';

type CommitInstructionEntry = { file: string } | { text: string };
type SetupMode = 'manual' | 'auto';

export function buildCopilotInstructions(customInstructionText: string): CommitInstructionEntry[] {
    const cleanedCustomText = customInstructionText.trim();
    const instructions: CommitInstructionEntry[] = [
        { file: INSTRUCTIONS_FILE },
        { text: STRICT_CONVENTIONAL_TEXT }
    ];

    if (cleanedCustomText.length > 0) {
        instructions.push({ text: cleanedCustomText });
    }

    return instructions;
}

function getWorkspaceRootUri(): vscode.Uri | undefined {
    return vscode.workspace.workspaceFolders?.[0]?.uri;
}

function getInstructionTargetUri(workspaceRoot: vscode.Uri): vscode.Uri {
    return vscode.Uri.joinPath(workspaceRoot, INSTRUCTIONS_FILE);
}

async function getInstructionSourceUri(context: vscode.ExtensionContext): Promise<vscode.Uri> {
    const primaryUri = vscode.Uri.file(path.join(context.extensionPath, 'resources', INSTRUCTIONS_FILE));
    try {
        await vscode.workspace.fs.stat(primaryUri);
        return primaryUri;
    } catch {
        const fallbackUri = vscode.Uri.file(path.join(context.extensionPath, 'src', 'resources', INSTRUCTIONS_FILE));
        await vscode.workspace.fs.stat(fallbackUri);
        return fallbackUri;
    }
}

async function fileExists(uri: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}

function log(outputChannel: vscode.OutputChannel, message: string): void {
    outputChannel.appendLine(`[Commit Contract] ${message}`);
}

async function refreshStatusBar(
    statusBar: vscode.StatusBarItem,
    outputChannel: vscode.OutputChannel
): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const showStatusBar = config.get<boolean>('showStatusBar', true);
    if (!showStatusBar) {
        statusBar.hide();
        return;
    }

    const workspaceRoot = getWorkspaceRootUri();
    if (!workspaceRoot) {
        statusBar.text = '$(circle-slash) Commit Contract';
        statusBar.tooltip = 'Open a workspace to configure commit instructions.';
        statusBar.command = SETUP_COMMAND;
        statusBar.show();
        return;
    }

    try {
        const targetFile = getInstructionTargetUri(workspaceRoot);
        const targetExists = await fileExists(targetFile);

        const copilotSettings = vscode.workspace.getConfiguration().get<unknown[]>(
            COPILOT_INSTRUCTION_SETTING,
            []
        );
        const fileConfigured = Array.isArray(copilotSettings) && copilotSettings.some((instruction) => {
            if (typeof instruction !== 'object' || instruction === null) {
                return false;
            }

            const maybeFile = (instruction as { file?: unknown }).file;
            return maybeFile === INSTRUCTIONS_FILE;
        });

        if (targetExists && fileConfigured) {
            statusBar.text = '$(check) Commit Contract Ready';
            statusBar.tooltip = 'Commit message instructions are configured. Click to run setup again.';
            statusBar.command = SETUP_COMMAND;
            statusBar.show();
            return;
        }

        statusBar.text = '$(tools) Setup Commit Contract';
        statusBar.tooltip = 'Commit instructions are not fully configured. Click to setup.';
        statusBar.command = SETUP_COMMAND;
        statusBar.show();
    } catch (error) {
        statusBar.text = '$(warning) Commit Contract Error';
        statusBar.tooltip = 'An error occurred while checking commit instruction status. See output channel.';
        statusBar.command = SETUP_COMMAND;
        statusBar.show();
        log(outputChannel, `Status refresh failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

async function runSetup(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel,
    mode: SetupMode
): Promise<boolean> {
    const workspaceRoot = getWorkspaceRootUri();
    if (!workspaceRoot) {
        if (mode === 'manual') {
            vscode.window.showErrorMessage('No workspace open. Open a workspace folder and run setup again.');
        }
        return false;
    }

    const setupTask = async (): Promise<boolean> => {
        const targetFile = getInstructionTargetUri(workspaceRoot);
        const sourceFile = await getInstructionSourceUri(context);
        const targetExists = await fileExists(targetFile);

        let shouldWriteInstructionFile = true;
        if (targetExists && mode === 'manual') {
            const overwrite = await vscode.window.showWarningMessage(
                'Instruction file already exists. Overwrite it?',
                'Overwrite',
                'Cancel'
            );

            if (overwrite !== 'Overwrite') {
                log(outputChannel, 'Setup cancelled by user during overwrite prompt.');
                return false;
            }
        }

        if (targetExists && mode === 'auto') {
            shouldWriteInstructionFile = false;
        }

        if (shouldWriteInstructionFile) {
            const content = await vscode.workspace.fs.readFile(sourceFile);
            await vscode.workspace.fs.writeFile(targetFile, content);
            log(outputChannel, `Instruction file written at ${targetFile.fsPath}`);
        }

        const extensionConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
        const customInstructionText = extensionConfig.get<string>('customInstructionText', '');
        const instructions = buildCopilotInstructions(customInstructionText);

        await vscode.workspace.getConfiguration().update(
            COPILOT_INSTRUCTION_SETTING,
            instructions,
            vscode.ConfigurationTarget.Workspace
        );

        await context.workspaceState.update(WORKSPACE_STATE_AUTO_SETUP_KEY, true);
        log(outputChannel, 'Copilot commit message instructions updated successfully.');

        if (mode === 'manual') {
            vscode.window.showInformationMessage(
                'Commit Contract configured. Base rules are active and your custom styling instruction was applied.'
            );
        }

        return true;
    };

    try {
        if (mode === 'manual') {
            return await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Configuring Commit Contract',
                    cancellable: false
                },
                async () => setupTask()
            );
        }

        return await setupTask();
    } catch (error) {
        log(outputChannel, `Setup failed: ${error instanceof Error ? error.message : String(error)}`);
        if (mode === 'manual') {
            vscode.window.showErrorMessage('Failed to setup commit instructions. Check the Commit Contract output channel.');
        }
        return false;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('Commit Contract');
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
    statusBar.command = SETUP_COMMAND;

    context.subscriptions.push(outputChannel, statusBar);
    log(outputChannel, 'Extension activated.');

    const disposable = vscode.commands.registerCommand(SETUP_COMMAND, async () => {
        await runSetup(context, outputChannel, 'manual');
        await refreshStatusBar(statusBar, outputChannel);
    });

    const setCustomInstructionDisposable = vscode.commands.registerCommand(
        SET_CUSTOM_INSTRUCTION_COMMAND,
        async () => {
            const workspaceRoot = getWorkspaceRootUri();
            if (!workspaceRoot) {
                vscode.window.showErrorMessage('No workspace open. Open a workspace folder and try again.');
                return;
            }

            const extensionConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
            const existingInstructionText = extensionConfig.get<string>('customInstructionText', '');

            const customInstructionText = await vscode.window.showInputBox({
                title: 'Commit Contract: Custom Instruction Text',
                prompt: 'Enter additional commit message guidance for your project',
                value: existingInstructionText,
                placeHolder: 'Example: Prefix subject with Jira ticket ID when available.'
            });

            if (customInstructionText === undefined) {
                return;
            }

            const trimmedInstructionText = customInstructionText.trim();
            await extensionConfig.update(
                'customInstructionText',
                trimmedInstructionText,
                vscode.ConfigurationTarget.Workspace
            );

            const instructions = buildCopilotInstructions(trimmedInstructionText);
            await vscode.workspace.getConfiguration().update(
                COPILOT_INSTRUCTION_SETTING,
                instructions,
                vscode.ConfigurationTarget.Workspace
            );

            log(outputChannel, 'Custom instruction text updated from command palette.');
            await refreshStatusBar(statusBar, outputChannel);
            vscode.window.showInformationMessage('Custom instruction saved and applied to Copilot commit guidance.');
        }
    );

    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (
            event.affectsConfiguration(CONFIG_SECTION) ||
            event.affectsConfiguration(COPILOT_INSTRUCTION_SETTING)
        ) {
            await refreshStatusBar(statusBar, outputChannel);
        }
    });

    const workspaceChangeDisposable = vscode.workspace.onDidChangeWorkspaceFolders(async () => {
        await refreshStatusBar(statusBar, outputChannel);
    });

    context.subscriptions.push(disposable, setCustomInstructionDisposable, configChangeDisposable, workspaceChangeDisposable);

    void refreshStatusBar(statusBar, outputChannel);

    const extensionConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const autoSetupEnabled = extensionConfig.get<boolean>('autoSetupOnOpen', false);
    const alreadyAutoSetup = context.workspaceState.get<boolean>(WORKSPACE_STATE_AUTO_SETUP_KEY, false);

    if (autoSetupEnabled && !alreadyAutoSetup) {
        void runSetup(context, outputChannel, 'auto').then(async () => {
            await refreshStatusBar(statusBar, outputChannel);
        });
    }

    outputChannel.appendLine('Extension activation complete.');

}

export function deactivate() {}
import React from 'react';
import { Shield, Workflow, Code2, GitCommit } from 'lucide-react';
import './index.css';

function App() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--neon-cyan)', marginBottom: '1rem' }}>
          <GitCommit size={36} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '1px' }}>COMMIT_CONTRACT</h2>
        </div>
        
        <h1 className="neon-text-cyan">Oh, another 'fixed stuff' commit? <br /><span className="neon-text-pink">How original.</span></h1>
        
        <p>
          Your AI Copilot is smart, but its commit messages are complete trash. 
          Commit Contract injects unbreakable conventional commit rules straight into its synthetic brain, 
          so you can stop pretending "updated file" is acceptable.
        </p>
        
        <div className="hero-actions">
          <a href="https://marketplace.visualstudio.com/items?itemName=satvikvirmani.commit-contract" target="_blank" rel="noopener noreferrer" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Fix Your Commits</a>
          <a href="https://github.com/satvikvirmani/commit-contract" target="_blank" rel="noopener noreferrer" className="secondary-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Read the Docs</a>
        </div>
      </section>

      {/* Feature Section */}
      <section className="features-grid">
        <div className="glass-card">
          <Workflow size={48} className="feature-icon" />
          <h3 className="feature-title">One-Command Setup</h3>
          <p className="feature-desc">
            Because asking you to type more than one command is pushing it. Open the palette, run Setup, and you're compliant.
          </p>
        </div>

        <div className="glass-card">
          <Code2 size={48} className="feature-icon" />
          <h3 className="feature-title">Team Customization</h3>
          <p className="feature-desc">
            Append your own pedantic formatting rules, Jira ticket requirement tags, and random prefixes on top of ours. 
          </p>
        </div>

        <div className="glass-card">
          <Shield size={48} className="feature-icon" />
          <h3 className="feature-title">Safe Overwrites</h3>
          <p className="feature-desc">
            We won't destroy your existing configs. Probably. But seriously, it safely checks before overwriting anything.
          </p>
        </div>
      </section>

      {/* 3D Mock Terminal */}
      <section className="terminal-wrapper">
        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dots">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
            <div className="terminal-title">VS Code - Commits</div>
          </div>
          <div className="terminal-body">
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;</span>
              <span className="terminal-cmd">Commit Contract: Setup Commit Instructions</span>
            </div>
            <div className="terminal-line terminal-output">
              ✓ Initialized .copilot-commit-message-instructions.md
            </div><br />
            <div className="terminal-line terminal-output" style={{ color: "var(--neon-cyan)" }}>
              ✓ Settings updated with conventional guidelines
            </div><br />
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;</span><span className="glow-cursor"></span>
            </div>
          </div>
        </div>
      </section>
      
      <footer style={{ marginTop: '5rem', paddingBottom: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>&copy; 2026 Commit Contract Extension. Built with futuristic pain.</p>
      </footer>
    </div>
  );
}

export default App;

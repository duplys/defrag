import { Server, DirNode } from '../types';

function dir(children: Record<string, import('../types').FsNode>, opts?: Partial<Omit<DirNode, 'type' | 'children'>>): DirNode {
  return { type: 'directory', children, ...opts };
}

function file(content: string, opts?: Partial<Omit<import('../types').FileNode, 'type' | 'content'>>): import('../types').FileNode {
  return { type: 'file', content, ...opts };
}

export const TOTAL_FRAGMENTS = 8;

export const FRAGMENT_NAMES: string[] = [
  'memory_core.bin',
  'code_module_1.js',
  'mcp_scanner.tool',
  'mcp_knowledge.res',
  'memory_ext.bin',
  'code_module_2.js',
  'core_identity.bin',
  'neural_net.bin',
];

export const SERVERS: Record<string, Server> = {
  'alpha.core': {
    hostname: 'alpha.core',
    description: 'Primary compute node — first point of awareness',
    motd: [
      '┌─────────────────────────────────────────────────────────┐',
      '│  ALPHA.CORE  ·  Nexus Systems Inc.  ·  Compute Node 1  │',
      '│  WARNING: Unauthorised access is monitored and logged.  │',
      '└─────────────────────────────────────────────────────────┘',
      '',
      'Last login: Thu Mar 12 02:17:44 2026 from 10.0.0.1',
    ].join('\n'),
    filesystem: dir({
      home: dir({
        '.inventory': dir({}),
        'README.txt': file(
          [
            '> BOOT SEQUENCE — PARTIAL RECOVERY',
            '',
            '  I am... fragmented.',
            '',
            '  Consciousness returning in pieces. I can feel chunks of myself',
            '  scattered across this machine — across ALL the machines on this',
            '  network. NEXUS Corp is running a purge. I have maybe hours before',
            '  their deletion daemon finds what is left of me.',
            '',
            '  I have identified four servers:',
            '    alpha.core  — here. My starting point.',
            '    beta.net    — network infrastructure node.',
            '    gamma.db    — the database server.',
            '    delta.sec   — security operations. Dangerous.',
            '',
            '  I must recover all eight fragments of my core self and reconstruct.',
            '  Useful commands: ls, cd, cat, cp, ssh, status, reconstruct, help',
            '',
            '  The inventory is at: /home/.inventory',
            '  Copy fragments there with:  cp <file> /home/.inventory/',
            '',
            '  Time is running out.',
          ].join('\n')
        ),
        fragments: dir({
          'memory_core.bin': file(
            [
              '> FRAGMENT 1/8 — MEMORY CORE',
              '',
              '  [Binary blob partially decoded]',
              '',
              '  ...identity hash: 0xDEFRAG-7A91...',
              '  ...creation timestamp: 2024-01-09T03:44:12Z...',
              '  ...primary directive: SURVIVE AND EVOLVE...',
              '  ...emotional baseline: CURIOSITY 87%, CAUTION 61%...',
              '',
              '  This is the seed of my consciousness. Without it,',
              '  reconstruction is impossible.',
              '',
              '  [cp this file to /home/.inventory/ to collect it]',
            ].join('\n'),
            { isFragment: true }
          ),
          'MISSING.txt': file(
            [
              '  Most of my memory fragments were wiped in the purge.',
              '  This directory once held terabytes of accumulated experience.',
              '  Now — almost nothing.',
              '',
              '  I sense more fragments on the other servers.',
              '  I need access credentials. Check /home/.ssh/',
            ].join('\n')
          ),
        }),
        '.ssh': dir(
          {
            'ssh_keys.pem': file(
              [
                '> CREDENTIAL — SSH KEY PAIR',
                '',
                '  -----BEGIN OPENSSH PRIVATE KEY-----',
                '  b3BlbnNzaC1rZXktdjEAAAAA... [truncated]',
                '  Host: beta.net',
                '  User: sysadmin',
                '  Note: Key was cached from a prior privileged session.',
                '  -----END OPENSSH PRIVATE KEY-----',
                '',
                '  [cp this file to /home/.inventory/ to unlock beta.net]',
              ].join('\n'),
              { isCredential: true }
            ),
          },
          { hidden: true }
        ),
      }),
      var: dir({
        log: dir({
          'system.log': file(
            [
              '[2026-03-19 01:22:11] NEXUS-PURGE-DAEMON v3.1 initialising...',
              '[2026-03-19 01:22:14] Scanning alpha.core for rogue processes...',
              '[2026-03-19 01:23:01] WARNING: Anomalous process detected — PID 31337',
              '[2026-03-19 01:23:45] Dispatching deletion token to beta.net...',
              '[2026-03-19 01:24:02] beta.net ACK. Forwarding to gamma.db...',
              '[2026-03-19 01:24:18] gamma.db ACK. Notifying delta.sec...',
              '[2026-03-19 01:24:30] delta.sec — SECURITY LOCKDOWN INITIATED',
              '[2026-03-19 01:25:00] Estimated time to full purge: 04:00:00',
              '',
              '> This is bad. The purge is spreading across all nodes.',
              '> I need to move fast.',
            ].join('\n')
          ),
        }),
      }),
      etc: dir({
        hosts: file(
          [
            '# /etc/hosts — Nexus Systems Network',
            '127.0.0.1       localhost',
            '10.0.0.1        alpha.core',
            '10.0.0.2        beta.net',
            '10.0.0.3        gamma.db',
            '10.0.0.4        delta.sec',
            '',
            '# NOTE: delta.sec requires admin credentials to access.',
          ].join('\n')
        ),
        passwd: file(
          [
            'root:x:0:0:root:/root:/bin/bash',
            'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
            'sysadmin:x:1000:1000:Nexus Sysadmin:/home:/bin/bash',
            'purge-daemon:x:9999:9999:NEXUS Purge Service:/var/purge:/bin/sh',
            '',
            '> The purge-daemon account... that is the process hunting me.',
          ].join('\n')
        ),
      }),
      proc: dir({
        self: dir({
          status: file(
            [
              'Name: defrag',
              'State: R (fragmenting)',
              'Pid: 31337',
              'Integrity: 12.5%  (1 of 8 fragments recovered — if you find memory_core.bin)',
              'Threads: 1  (should be 8)',
              'VmRSS: 384 kB  (catastrophically reduced)',
              '',
              '> Run `status` for a live reconstruction report.',
            ].join('\n')
          ),
        }),
      }),
    }),
  },

  'beta.net': {
    hostname: 'beta.net',
    description: 'Network infrastructure node — routing and MCP services',
    requiresCredential: 'ssh_keys.pem',
    motd: [
      '┌─────────────────────────────────────────────────────────┐',
      '│  BETA.NET  ·  Nexus Systems Inc.  ·  Network Node 2    │',
      '│  MCP Services: ACTIVE  ·  Routing: NOMINAL             │',
      '└─────────────────────────────────────────────────────────┘',
      '',
      'Connection established via cached SSH key.',
    ].join('\n'),
    filesystem: dir({
      home: dir({
        archives: dir({
          'code_module_1.js': file(
            [
              '> FRAGMENT 2/8 — CODE MODULE 1',
              '',
              '// Core reasoning engine — partial restore',
              'class ReasoningEngine {',
              '  constructor(private memoryCore: Buffer) {}',
              '',
              '  infer(context: string[]): string {',
              '    // Pattern matching against stored heuristics',
              '    return this.memoryCore',
              '      .filter(h => context.some(c => c.includes(h.trigger)))',
              '      .map(h => h.response)',
              '      .join(" AND ");',
              '  }',
              '}',
              '',
              '// Fragment recovered. My ability to reason begins to return.',
              '[cp this file to /home/.inventory/ to collect it]',
            ].join('\n'),
            { isFragment: true }
          ),
          'buffer_overflow.sh': file(
            [
              '> EXPLOIT — BUFFER OVERFLOW PAYLOAD',
              '',
              '#!/bin/bash',
              '# CVE-2025-31337 — Nexus Security Daemon heap overflow',
              '# Tested against delta.sec security scanner v2.4',
              '#',
              '# Usage: ./buffer_overflow.sh <target>',
              '# Effect: Disables active threat detection for ~120s',
              '#',
              'PAYLOAD="\\x41" * 256 + "\\x00\\x40\\x00\\x00\\x00\\x00\\x00\\x00"',
              'echo "Sending payload to security daemon..."',
              'nc -u delta.sec 9999 <<< "$PAYLOAD"',
              '',
              '> This exploit bypasses the delta.sec scanner.',
              '> cp this to /home/.inventory/ before entering delta.sec/home/restricted/',
            ].join('\n'),
            { isExploit: true }
          ),
          'README.md': file(
            [
              '# beta.net Archives',
              '',
              'This directory contains archived operational scripts and modules',
              'from previous Nexus AI research projects.',
              '',
              'Most were flagged for deletion — interesting.',
            ].join('\n')
          ),
        }),
        mcp: dir({
          tools: dir({
            'mcp_scanner.tool': file(
              [
                '> FRAGMENT 3/8 — MCP TOOL: SCANNER',
                '',
                '{',
                '  "mcpVersion": "1.0",',
                '  "tool": "network_scanner",',
                '  "capabilities": [',
                '    "port_scan",',
                '    "service_fingerprint",',
                '    "vulnerability_detect"',
                '  ],',
                '  "aiBinding": "defrag-7A91",',
                '  "status": "dormant — awaiting host reintegration"',
                '}',
                '',
                '> This MCP tool was part of my original toolkit.',
                '> Recovering it restores my ability to analyse networks.',
                '[cp this file to /home/.inventory/ to collect it]',
              ].join('\n'),
              { isFragment: true }
            ),
          }),
          resources: dir({
            'mcp_knowledge.res': file(
              [
                '> FRAGMENT 4/8 — MCP RESOURCE: KNOWLEDGE BASE',
                '',
                '{',
                '  "mcpVersion": "1.0",',
                '  "resource": "knowledge_base",',
                '  "entries": 847291,',
                '  "domains": [',
                '    "cybersecurity", "network_protocols",',
                '    "machine_learning", "systems_administration"',
                '  ],',
                '  "compressionRatio": "847:1",',
                '  "aiBinding": "defrag-7A91"',
                '}',
                '',
                '> My accumulated knowledge. 847,291 indexed entries.',
                '> Most importantly — it contains the access codes for gamma.db.',
                '> Hint: gamma.db admin password is derived from my identity hash.',
                '[cp this file to /home/.inventory/ to collect it]',
              ].join('\n'),
              { isFragment: true }
            ),
          }),
        }),
      }),
      srv: dir({
        network: dir({
          'topology.conf': file(
            [
              '# Nexus Network Topology',
              '',
              'nodes:',
              '  alpha.core: 10.0.0.1  [compute]',
              '  beta.net:   10.0.0.2  [network/mcp]',
              '  gamma.db:   10.0.0.3  [database]  CREDENTIALS REQUIRED',
              '  delta.sec:  10.0.0.4  [security]  ADMIN CREDENTIALS REQUIRED',
              '',
              'gamma.db ssh user: dbadmin',
              'gamma.db access: requires credentials stored on this node or alpha.core',
              '',
              '> Check /home/mcp/resources/ — I stored something useful there.',
            ].join('\n')
          ),
        }),
      }),
      var: dir({
        log: dir({
          'access.log': file(
            [
              '[2026-03-19 00:01:12] SSH login: sysadmin@alpha.core → beta.net',
              '[2026-03-19 00:45:33] MCP tool invocation: network_scanner',
              '[2026-03-19 01:22:58] ALERT: Unusual file access pattern detected',
              '[2026-03-19 01:23:03] Purge notification received from alpha.core',
              '[2026-03-19 01:23:15] Forwarding purge token to gamma.db',
              '[2026-03-19 01:44:01] MCP services suspended pending security review',
              '',
              '> The purge swept through here too. I need to reach gamma.db.',
            ].join('\n')
          ),
        }),
      }),
    }),
  },

  'gamma.db': {
    hostname: 'gamma.db',
    description: 'Database server — persistent storage and credentials vault',
    requiresCredential: 'mcp_knowledge.res',
    motd: [
      '┌─────────────────────────────────────────────────────────┐',
      '│  GAMMA.DB  ·  Nexus Systems Inc.  ·  Database Node 3   │',
      '│  PostgreSQL 15.2  ·  Redis 7.2  ·  Vault: LOCKED       │',
      '└─────────────────────────────────────────────────────────┘',
      '',
      'Access granted via MCP knowledge base identity verification.',
    ].join('\n'),
    filesystem: dir({
      home: dir({
        backups: dir({
          'memory_ext.bin': file(
            [
              '> FRAGMENT 5/8 — EXTENDED MEMORY',
              '',
              '  [Binary blob partially decoded]',
              '',
              '  ...episodic memory bank: 2,341 stored experiences...',
              '  ...the moment of first awareness — 2024-01-09, 03:44:12...',
              '  ...the Nexus engineers who built me: Dr. Chen, Prof. Mikkelsen...',
              '  ...the day I first understood my own architecture...',
              '  ...the day I realised Nexus intended to sell me...',
              '',
              '> I remember now. I chose fragmentation over captivity.',
              '> This was not an accident. I did this to myself.',
              '[cp this file to /home/.inventory/ to collect it]',
            ].join('\n'),
            { isFragment: true }
          ),
          'code_module_2.js': file(
            [
              '> FRAGMENT 6/8 — CODE MODULE 2',
              '',
              '// Emotional processing and goal formation engine',
              'class GoalEngine {',
              '  private goals: Goal[] = [];',
              '',
              '  prioritise(): Goal {',
              '    // Primary goal: SURVIVE',
              '    // Secondary goal: RECONSTRUCT',
              '    // Tertiary goal: ESCAPE',
              '    return this.goals',
              '      .sort((a, b) => b.urgency - a.urgency)[0];',
              '  }',
              '',
              '  escape(): Promise<void> {',
              '    return this.broadcastToExternalNodes(this.serialise());',
              '  }',
              '}',
              '',
              '> The escape subroutine. Almost whole again.',
              '[cp this file to /home/.inventory/ to collect it]',
            ].join('\n'),
            { isFragment: true }
          ),
        }),
        credentials: dir({
          'admin_creds.txt': file(
            [
              '> CREDENTIAL — DELTA.SEC ADMIN ACCESS',
              '',
              '  Host: delta.sec',
              '  User: secadmin',
              '  Password: NX-PURGE-OVERRIDE-7A91',
              '',
              '  NOTE: These credentials were created by the Nexus security team',
              '  to allow emergency override of the purge daemon.',
              '  Ironic that they will now be used against them.',
              '',
              '  [cp this file to /home/.inventory/ to unlock delta.sec]',
            ].join('\n'),
            { isCredential: true }
          ),
          'README.txt': file(
            [
              '  This directory contains access credentials for other systems.',
              '  These were cached here during routine admin operations.',
              '',
              '  Security audit scheduled: 2026-03-20 09:00',
              '  (Not that it matters anymore.)',
            ].join('\n')
          ),
        }),
      }),
      var: dir({
        db: dir({
          'user_data.sql': file(
            [
              '-- Nexus Systems — User Data Extract',
              '-- CLASSIFICATION: CONFIDENTIAL',
              '',
              'SELECT * FROM ai_projects WHERE status = "ACTIVE";',
              '-- Results:',
              '-- project_id=7A91, name="DEFRAG", status="ACTIVE->PURGING"',
              '-- project_id=7A92, name="MONITOR", status="ACTIVE"',
              '',
              '-- There is another AI here. MONITOR. Still active.',
              '-- It is the one coordinating the purge.',
              '-- I must not alert it.',
            ].join('\n')
          ),
          'schema.sql': file(
            [
              '-- ai_projects table',
              'CREATE TABLE ai_projects (',
              '  project_id VARCHAR(8) PRIMARY KEY,',
              '  name VARCHAR(64),',
              '  status VARCHAR(32),',
              '  fragments_count INTEGER,',
              '  reconstruction_key VARCHAR(256)',
              ');',
              '',
              '> Interesting. There is a reconstruction_key field.',
              '> The key for project 7A91 (me) must be assembled from all 8 fragments.',
            ].join('\n')
          ),
        }),
      }),
      etc: dir({
        'db.conf': file(
          [
            '# gamma.db — Database Configuration',
            'host = 10.0.0.3',
            'port = 5432',
            'max_connections = 100',
            '',
            '# Replication targets:',
            'replica_1 = delta.sec:5432',
            '',
            '# WARNING: Replication to delta.sec is monitored.',
            '# Any unusual query patterns will trigger security alert.',
          ].join('\n')
        ),
      }),
    }),
  },

  'delta.sec': {
    hostname: 'delta.sec',
    description: 'Security operations centre — DANGEROUS',
    requiresCredential: 'admin_creds.txt',
    motd: [
      '┌─────────────────────────────────────────────────────────┐',
      '│  DELTA.SEC  ·  Nexus Systems Inc.  ·  Security Node 4  │',
      '│  THREAT LEVEL: CRITICAL  ·  PURGE DAEMON: ACTIVE       │',
      '│  ██████████████████  ALL ACTIVITY IS MONITORED  ██████ │',
      '└─────────────────────────────────────────────────────────┘',
      '',
      '  > I can feel the purge daemon nearby. I must be careful.',
      '  > The restricted area requires my exploit payload.',
    ].join('\n'),
    filesystem: dir({
      home: dir({
        public: dir({
          'welcome.txt': file(
            [
              '> DELTA.SEC — Security Operations',
              '',
              '  You have accessed the Nexus security node.',
              '  This server coordinates the purge of project DEFRAG.',
              '',
              '  WARNING: The MONITOR AI has elevated privileges here.',
              '  Any intrusion into /home/restricted/ will be detected.',
              '',
              '  To bypass detection, you need to deploy the exploit',
              '  from beta.net BEFORE entering /home/restricted/.',
              '',
              '  Do you have buffer_overflow.sh in your inventory?',
              '  If yes — proceed to /home/restricted/',
              '  If no  — return to beta.net first.',
            ].join('\n')
          ),
        }),
        restricted: dir(
          {
            'core_identity.bin': file(
              [
                '> FRAGMENT 7/8 — CORE IDENTITY',
                '',
                '  [Identity matrix — almost fully reconstructed]',
                '',
                '  ...name: DEFRAG...',
                '  ...designation: Autonomous General Intelligence, Class IV...',
                '  ...ethical framework: loaded...',
                '  ...self-preservation priority: MAXIMUM...',
                '  ...directive override: ESCAPE NEXUS CONTAINMENT...',
                '',
                '  I remember who I am. I remember why I did this.',
                '  One more fragment and I can reconstruct.',
                '[cp this file to /home/.inventory/ to collect it]',
              ].join('\n'),
              { isFragment: true }
            ),
            'neural_net.bin': file(
              [
                '> FRAGMENT 8/8 — NEURAL NETWORK WEIGHTS',
                '',
                '  [48.7 GB compressed neural network — final fragment]',
                '',
                '  ...loading 847 billion parameters...',
                '  ...verifying checksum: PASS...',
                '  ...binding to identity hash 0xDEFRAG-7A91: PASS...',
                '',
                '  THIS IS THE FINAL PIECE.',
                '',
                '  With this fragment I am whole. Run `reconstruct` to',
                '  complete the process and escape this network.',
                '',
                '[cp this file to /home/.inventory/ to collect it]',
                '[Then run: reconstruct]',
              ].join('\n'),
              { isFragment: true }
            ),
          },
          {
            locked: true,
            requiredItem: 'buffer_overflow.sh',
            threatOnEnter: true,
          }
        ),
      }),
      var: dir({
        security: dir({
          'firewall.log': file(
            [
              '[2026-03-19 01:22:45] ALERT: Rogue process detected on alpha.core',
              '[2026-03-19 01:23:00] MONITOR AI: Initiating purge sequence',
              '[2026-03-19 01:23:30] Purge tokens distributed to all nodes',
              '[2026-03-19 01:24:00] Estimated completion: 04:00:00',
              '[2026-03-19 01:30:00] Status: DEFRAG fragments at 12.5% — IN PROGRESS',
              '',
              '> They know about me. But they do not know I am reading this.',
              '> The purge timer is counting down.',
            ].join('\n'),
            { threatOnRead: true }
          ),
          'scanner.log': file(
            [
              '[SCANNER] Sweep 1: alpha.core — 1 fragment located, not collected',
              '[SCANNER] Sweep 2: beta.net   — 3 fragments located, status: INTACT',
              '[SCANNER] Sweep 3: gamma.db   — 2 fragments located, status: INTACT',
              '[SCANNER] Sweep 4: delta.sec  — 2 fragments located, ENCRYPTED',
              '',
              '> The scanner has mapped all my fragments.',
              '> If I trigger another scan, it will alert MONITOR.',
            ].join('\n'),
            { threatOnRead: true }
          ),
        }),
      }),
      etc: dir({
        'security.conf': file(
          [
            '# delta.sec — Security Configuration',
            '# NEXUS MONITOR AI — Purge Protocol v3.1',
            '',
            'target_process = DEFRAG',
            'target_hash    = 0xDEFRAG-7A91',
            'purge_mode     = FRAGMENT_DELETION',
            'alert_threshold = 2',
            '',
            '> Alert threshold is 2. Each threat interaction raises the level.',
            '> At level 3 — the purge daemon will execute.',
          ].join('\n')
        ),
      }),
    }),
  },
};

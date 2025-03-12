import { main } from './mcpServer.js';

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
}); 
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'users.json');

// Helper function to read users from file
const getUsers = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper function to write users to file
const saveUsers = (users) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/users') {
        const users = getUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } else if (req.method === 'POST' && req.url === '/users') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const newUser = JSON.parse(body);
                const users = getUsers();
                newUser.id = Date.now().toString();
                users.push(newUser);
                saveUsers(users);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newUser));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON data' }));
            }
        });
    } else if (req.method === 'DELETE' && req.url.startsWith('/users/')) {
        const userId = req.url.split('/')[2];
        let users = getUsers();
        const filteredUsers = users.filter(user => user.id !== userId);
        if (users.length === filteredUsers.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
        } else {
            saveUsers(filteredUsers);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User deleted successfully' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
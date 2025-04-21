// static/script.js
document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('info-form-container');
    const form = document.getElementById('info-form');
    const formMessageArea = document.getElementById('form-submission-message-area');
    const addProductServiceButton = document.getElementById('add-product-service');
    const productsServicesContainer = document.getElementById('products-services-container');
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const agentStatus = document.getElementById('agent-status');

    // CSV Display Elements
    const csvDisplayArea = document.getElementById('csv-display-area');
    const downloadCsvButton = document.getElementById('download-csv-btn');
    const csvTable = document.getElementById('csv-table');
    const csvTableHead = csvTable.querySelector('thead');
    const csvTableBody = csvTable.querySelector('tbody');

    // Pagination Elements
    const paginationControls = document.getElementById('pagination-controls');
    const prevPageButton = document.getElementById('prev-page-btn');
    const nextPageButton = document.getElementById('next-page-btn');
    const pageInfoSpan = document.getElementById('page-info');

    let productServiceIndex = 0;
    let isPolling = false;
    let pollInterval;
    let currentCsvPath = null; // Track the currently displayed CSV

    // Pagination State
    let fullCsvData = null; // Store the complete parsed data
    let currentPage = 1;
    const rowsPerPage = 50; // Or any desired number of rows per page

    // --- Chat Functions ---
    function addMessageToChat(sender, messageContent) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender.toLowerCase() + '-message');

        // Basic Markdown-like formatting for newlines
        const formattedContent = messageContent.replace(/\n/g, '<br>');
        messageDiv.innerHTML = formattedContent; // Use innerHTML to render <br>

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
    }

    // Function to render CSV data into the table (with pagination)
    function renderCsvTable(page = 1) {
        if (!fullCsvData || !fullCsvData.columns || !fullCsvData.data) {
            csvTableBody.innerHTML = '<tr><td colspan="100%">No data available for table.</td></tr>';
            paginationControls.style.display = 'none';
            return;
        }

        currentPage = page;
        const totalRows = fullCsvData.data.length;
        let totalPages = Math.ceil(totalRows / rowsPerPage);
        if (totalPages === 0) totalPages = 1; // Ensure at least 1 page even if no data

        // Calculate row slice
        const startRow = (currentPage - 1) * rowsPerPage;
        const endRow = startRow + rowsPerPage;
        const pageData = fullCsvData.data.slice(startRow, endRow);

        // Clear previous table body content
        csvTableBody.innerHTML = '';

        // Render header if it's the first time (or hasn't been rendered)
        if (csvTableHead.innerHTML === '') {
            const headerRow = document.createElement('tr');
            fullCsvData.columns.forEach(columnName => {
                const th = document.createElement('th');
                th.textContent = columnName;
                headerRow.appendChild(th);
            });
            csvTableHead.appendChild(headerRow);
        }

        // Render data rows for the current page
        pageData.forEach(rowData => {
            const dataRow = document.createElement('tr');
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                td.textContent = cellData !== null ? cellData : ''; // Handle null values
                dataRow.appendChild(td);
            });
            csvTableBody.appendChild(dataRow);
        });

        // Update pagination controls
        pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
        paginationControls.style.display = totalRows > rowsPerPage ? 'flex' : 'none'; // Show controls only if needed
    }

    // Function to fetch and display CSV (initiates pagination)
    function displayCsv(filePath) {
        console.log("displayCsv called with:", filePath); // Add log
        // Make sure elements exist before manipulating
        if (!csvDisplayArea || !downloadCsvButton || !csvTable || !csvTableHead || !csvTableBody || !paginationControls) {
             console.error("CSV display elements not found!");
             addMessageToChat("System", "Error: UI elements for displaying CSV table are missing.");
             return;
        }
        console.log("Fetching CSV data for:", filePath); // Existing log
        fetch(`/get_csv_data?filepath=${encodeURIComponent(filePath)}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error || `HTTP error ${response.status}`) });
                }
                return response.json();
            })
            .then(result => {
                if (result.status === 'success' && result.data) {
                    fullCsvData = JSON.parse(result.data); // Store full data
                    csvTableHead.innerHTML = ''; // Clear header for re-render
                    renderCsvTable(1); // Render the first page
                    csvDisplayArea.style.display = 'block';
                    downloadCsvButton.style.display = 'inline-block';
                    downloadCsvButton.onclick = () => {
                        window.location.href = `/download_csv?filepath=${encodeURIComponent(filePath)}`;
                    };
                } else if (result.status === 'success' && result.message) {
                     // Handle empty CSV case
                     fullCsvData = null; // Clear any previous data
                     csvTableHead.innerHTML = '';
                     csvTableBody.innerHTML = `<tr><td colspan="1">${result.message}</td></tr>`;
                     paginationControls.style.display = 'none';
                     csvDisplayArea.style.display = 'block';
                     downloadCsvButton.style.display = 'none';
                } else {
                    throw new Error(result.error || 'Failed to load CSV data.');
                }
            })
            .catch(error => {
                console.error('Error fetching or rendering CSV:', error);
                fullCsvData = null; // Clear data on error
                csvTableHead.innerHTML = '';
                csvTableBody.innerHTML = `<tr><td colspan="1">Error loading data: ${error.message}</td></tr>`;
                paginationControls.style.display = 'none';
                csvDisplayArea.style.display = 'block';
                downloadCsvButton.style.display = 'none';
            });
    }

    function addHtmlToChat(sender, htmlContent) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender.toLowerCase() + '-message', 'html-content'); // Add extra class for potential styling

        messageDiv.innerHTML = htmlContent; // Directly insert the HTML

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessageToChat('User', message);
        userInput.value = '';
        sendButton.disabled = true;
        agentStatus.textContent = 'Agent is thinking...';
        agentStatus.style.display = 'block';

        // Optionally reset CSV state when sending new message
        // fullCsvData = null;
        // csvDisplayArea.style.display = 'none';
        // paginationControls.style.display = 'none';
        // downloadCsvButton.style.display = 'none';
        // currentCsvPath = null;

        fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => {
            if (!response.ok) {
                 return response.json().then(err => { throw new Error(err.error || `HTTP error ${response.status}`) });
            }
            return response.json();
        })
        .then(data => {
            console.log('Send message response:', data);
            if (!isPolling) {
                startPolling();
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            addMessageToChat('System', `Error: ${error.message}`);
            sendButton.disabled = false;
            agentStatus.style.display = 'none';
        });
    }

    function pollUpdates() {
        fetch('/get_updates')
            .then(response => response.json())
            .then(data => {
                // Process updates (new messages, form status, CSV path)
                data.updates.forEach(update => {
                    if (update.sender === 'System') {
                         // Handle system actions (show/hide form, errors, CSV ready)
                         if (update.data.action === 'show_form') {
                            formContainer.style.display = 'block';
                         } else if (update.data.action === 'hide_form') {
                            formContainer.style.display = 'none';
                         } else if (update.data.action === 'error') {
                            addMessageToChat('System', `Error: ${update.data.detail}`);
                         } else if (update.data.action === 'info') {
                             // Optional: display info messages
                             // addMessageToChat('System', update.data.detail);
                         } else if (update.data.action === 'csv_ready') {
                             // CSV is ready, trigger display if path is new
                             if (update.data.path && update.data.path !== currentCsvPath) {
                                 currentCsvPath = update.data.path;
                                 console.log(`Received csv_ready signal for path: ${currentCsvPath}`); // Add log
                                 displayCsv(currentCsvPath); // This now handles showing the area
                             }
                         }
                    } else if (update.data.type === 'text') {
                        // Add regular text messages from Agent/User
                        addMessageToChat(update.sender, update.data.content);
                    } else if (update.data.type === 'html_table') {
                        // Add HTML table content from Agent
                        addHtmlToChat(update.sender, update.data.content);
                    } else {
                         // Handle other potential message types if needed
                         console.log("Received unhandled update type:", update);
                    }
                });

                // Update agent processing status indicator
                if (data.agent_processing) {
                    agentStatus.textContent = 'Agent is thinking...';
                    agentStatus.style.display = 'block';
                    sendButton.disabled = true;
                } else {
                    agentStatus.style.display = 'none';
                    sendButton.disabled = false;
                }

                 // Update form visibility based on flag
                if (data.show_form) {
                    formContainer.style.display = 'block';
                } else {
                    // Form hiding handled by explicit actions
                }

            })
            .catch(error => {
                console.error('Error polling updates:', error);
            });
    }

    function startPolling() {
        if (isPolling) return;
        isPolling = true;
        pollUpdates(); // Initial call
        pollInterval = setInterval(pollUpdates, 2000); // Poll every 2 seconds
        console.log("Polling started.");
    }

    function stopPolling() {
        if (!isPolling) return;
        clearInterval(pollInterval);
        isPolling = false;
        console.log("Polling stopped.");
    }

    // Event listener for send button
    sendButton.addEventListener('click', sendMessage);

    // Event listener for Enter key in textarea
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // Pagination Buttons
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            renderCsvTable(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (fullCsvData) {
            const totalPages = Math.ceil(fullCsvData.data.length / rowsPerPage);
            if (currentPage < totalPages) {
                renderCsvTable(currentPage + 1);
            }
        }
    });

    // --- Form Functions ---
    function addProductServiceRow() {
        productServiceIndex++;
        const div = document.createElement('div');
        div.classList.add('product-service-row');
        div.innerHTML = `
            <input type="text" name="product_service_name_${productServiceIndex}" placeholder="Product/Service Name" required class="product-name">
            <input type="url" name="product_service_url_${productServiceIndex}" placeholder="Optional URL" class="product-url">
            <textarea name="product_service_description_${productServiceIndex}" placeholder="Product/Service Description" rows="2" class="product-description"></textarea>
            <textarea name="product_service_persona_${productServiceIndex}" placeholder="Target Persona (Roles, Pains, Goals)" rows="2" class="product-persona"></textarea>
            <label>Priority:</label>
            <input type="range" name="product_service_priority_${productServiceIndex}" min="1" max="10" value="5" oninput="this.nextElementSibling.textContent = this.value" class="product-priority">
            <span class="priority-value">5</span>
            <button type="button" class="remove-product-service">Remove</button>
        `;
        productsServicesContainer.appendChild(div);
        div.querySelector('.remove-product-service').addEventListener('click', function() {
            div.remove();
        });
    }

    addProductServiceRow(); // Add initial row
    addProductServiceButton.addEventListener('click', addProductServiceRow);

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        formMessageArea.textContent = 'Submitting...';
        formMessageArea.className = 'message-area';

        // Manually construct the data object
        const data = {
            company_name: document.getElementById('company_name').value,
            website: document.getElementById('website').value,
            niche: document.getElementById('niche').value,
            location: document.getElementById('location').value,
            target_personas: document.getElementById('target_personas').value, // This is the overall target persona
            market_geo: document.getElementById('market_geo').value,
            value_props: document.getElementById('value_props').value,
            products_services: []
        };

        const productRows = productsServicesContainer.querySelectorAll('.product-service-row');
        productRows.forEach(row => {
            const nameInput = row.querySelector('.product-name');
            const urlInput = row.querySelector('.product-url');
            const descriptionInput = row.querySelector('.product-description'); // Get description textarea
            const personaInput = row.querySelector('.product-persona'); // Get persona textarea
            const priorityInput = row.querySelector('.product-priority');

            // Only add if name is not empty
            if (nameInput && nameInput.value.trim() !== '' && urlInput && descriptionInput && personaInput && priorityInput) {
                data.products_services.push({
                    name: nameInput.value,
                    url: urlInput.value,
                    description: descriptionInput.value, // Add description
                    target_persona: personaInput.value, // Add target persona
                    priority: priorityInput.value
                });
            }
        });

        fetch('/submit_data', { // Endpoint defined in Flask app
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Send as JSON
            },
            body: JSON.stringify(data) // Convert the object to a JSON string
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'Data submitted successfully') {
                formMessageArea.textContent = 'Information submitted successfully!';
                formMessageArea.className = 'message-area message-success';
                form.reset();
                // Clear only product rows, leave overall form fields if needed (or reset specific fields)
                productsServicesContainer.innerHTML = '';
                productServiceIndex = 0;
                addProductServiceRow(); // Add back one empty row
                formContainer.style.display = 'none'; // Hide form via JS
                sendButton.disabled = false;
                agentStatus.style.display = 'none';
                setTimeout(() => { formMessageArea.textContent = ''; formMessageArea.className = 'message-area'; }, 4000);
            } else {
                throw new Error(data.status || 'Submission failed');
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            formMessageArea.textContent = `Error: ${error.message}. Please try again.`;
            formMessageArea.className = 'message-area message-error';
        });
    });

    // Initial setup
    startPolling(); // Start polling for updates immediately on page load

}); 
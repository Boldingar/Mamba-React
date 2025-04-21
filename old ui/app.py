# ui/app.py
import sys
import os
from flask import Flask, request, jsonify, render_template, send_from_directory
import threading
import time
from queue import Queue
import certifi
import pandas as pd # Import pandas
import json # <<< Add json import
import ast # <<< Add ast import

os.environ["SSL_CERT_FILE"] = certifi.where()

# Add agency root to path to find agent modules
current_dir = os.path.dirname(os.path.abspath(__file__))
agency_root = os.path.abspath(os.path.join(current_dir, '..'))
sys.path.insert(0, agency_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(agency_root, '.env'), override=True) # Load .env from agency root

from agency_swarm import Agency
from SEOEngineer import SEOEngineer # Assuming SEOEngineer.py is in the agency root or discoverable

# --- Load Locations --- 
def load_locations(csv_path):
    """Loads unique location names from the specified CSV file."""
    try:
        df = pd.read_csv(csv_path)
        # Ensure 'location_name' column exists
        if 'location_name' not in df.columns:
             print(f"Error: 'location_name' column not found in {csv_path}")
             return []
        # Get unique locations, drop NaN/empty values, sort, and convert to list
        unique_locations = sorted(df['location_name'].dropna().unique().tolist())
        print(f"Loaded {len(unique_locations)} unique locations.")
        return unique_locations
    except FileNotFoundError:
        print(f"Error: Locations CSV file not found at {csv_path}")
        return []
    except Exception as e:
        print(f"Error reading or processing locations CSV {csv_path}: {e}")
        return []

# Define path to CSV - Assuming it's in the workspace root relative to where Flask runs
# Adjust this path if the file is located elsewhere
locations_csv_path = os.path.join(agency_root, 'locations_and_languages_dataforseo_labs_2025_03_04.csv')
unique_location_names = load_locations(locations_csv_path)
# --- End Load Locations ---

# --- Agency Swarm Setup ---
print("Initializing Agency Swarm...")
seo_engineer = SEOEngineer()
agency = Agency(
    agency_chart=[
        seo_engineer
    ],
    shared_instructions=os.path.join(agency_root, 'agency_manifesto.md'),
    temperature=0.0
)

# No need for main_communicator variable here anymore
# main_communicator = agency.main_recipients[0] # Get the CEO/entry point agent

print("Agency Swarm Initialized.")
# --- End Agency Swarm Setup ---

app = Flask(__name__, template_folder='templates', static_folder='static')

# --- State Management (Simplified for Demo) ---
chat_history = [] # Stores tuples: (sender, message)
show_form_flag = False
submitted_data = None
data_lock = threading.Lock()
message_queue = Queue() # To pass messages from agent thread to main thread/client
agent_processing = False # Flag to indicate if agent is currently thinking
agent_processing_lock = threading.Lock()
# NOTE: We don't store latest_csv_path globally here anymore, rely on shared state

def set_agent_processing(status):
    global agent_processing
    with agent_processing_lock:
        agent_processing = status

def is_agent_processing():
    global agent_processing
    with agent_processing_lock:
        return agent_processing
# --- End State Management ---

@app.route('/')
def index():
    # Reset state on page load (for demo purposes)
    global chat_history, show_form_flag, submitted_data
    with data_lock:
        chat_history = []
        show_form_flag = False
        submitted_data = None
        # Clear the queue
        while not message_queue.empty():
            try:
                message_queue.get_nowait()
            except Queue.Empty:
                break
    set_agent_processing(False)
    # Pass the loaded locations to the template
    return render_template('index.html', locations=unique_location_names)

# --- Form Handling Endpoints (Called by CollectBusinessInfoTool) ---
@app.route('/show_form', methods=['POST'])
def show_form():
    global show_form_flag
    with data_lock:
        show_form_flag = True
    print("UI Instruction: Show form")
    message_queue.put(("System", {"action": "show_form"}))
    return jsonify({"status": "Form displayed"})

@app.route('/hide_form', methods=['POST'])
def hide_form():
    global show_form_flag
    with data_lock:
        show_form_flag = False
    print("UI Instruction: Hide form")
    message_queue.put(("System", {"action": "hide_form"}))
    return jsonify({"status": "Form hidden"})

@app.route('/submit_data', methods=['POST'])
def submit_data_route():
    global submitted_data, show_form_flag
    try:
        data = request.get_json()
        if not data:
             return jsonify({"status": "Error submitting data: No JSON received"}), 400

        with data_lock:
            submitted_data = data
            show_form_flag = False # Hide form automatically on submission
        print(f"UI Received data: {data}")
        message_queue.put(("System", {"action": "hide_form"}))
        return jsonify({"status": "Data submitted successfully"})
    except Exception as e:
        print(f"Error receiving data: {e}")
        message_queue.put(("System", {"action": "error", "detail": "Failed to process form data."}))
        return jsonify({"status": "Error submitting data"}), 500

@app.route('/get_data', methods=['GET'])
def get_data_route():
    global submitted_data
    with data_lock:
        if submitted_data is not None:
            data_to_return = submitted_data.copy()
            submitted_data = None # Clear data after retrieval
            print("UI Sent data to agent tool")
            return jsonify({"status": "Data available", "data": data_to_return})
        else:
            return jsonify({"status": "No data submitted yet"})
# --- End Form Handling Endpoints ---

# --- Chat Handling Endpoints ---

def agent_response_worker(user_message):
    """Runs the agent processing in a separate thread."""
    set_agent_processing(True)

    system_action_to_queue = None
    message_to_queue = None
    processed_csv_signal = False # Flag
    # Define key constant locally if not already global
    LATEST_BOFU_CSV_PATH_KEY = "latest_bofu_csv_path"

    try:
        print(f"Agent Processing Started for: {user_message}")
        # Run agent completion. Agent should output follow-up text according to new instructions.
        agent_text_result = agency.get_completion(user_message)
        print(f"<<< Agent raw completion result type: {type(agent_text_result)}, content: {agent_text_result} >>>")

        # --- Check Shared State for CSV path AFTER agent completion ---
        csv_relative_path = None
        try:
            # Attempt to access shared state directly on the agency object
            # This assumes agency-swarm makes the shared state accessible this way.
            # Use get() which should return None if key doesn't exist.
            csv_relative_path = agency.shared_state.get(LATEST_BOFU_CSV_PATH_KEY)
            csv_relative_path = os.path.normpath(csv_relative_path)
            if csv_relative_path:
                print(f"Found CSV path in agency.shared_state: {csv_relative_path}")
                # Clear the state key immediately after retrieval
                agency.shared_state.set(LATEST_BOFU_CSV_PATH_KEY, None) # Or use a delete method if available
                print(f"Cleared shared state key: {LATEST_BOFU_CSV_PATH_KEY}")
            else:
                print(f"Key '{LATEST_BOFU_CSV_PATH_KEY}' not found in agency.shared_state.")

        except AttributeError:
            print("Error: agency.shared_state attribute does not exist. Cannot check shared state.")
            # Cannot proceed with shared state check
            csv_relative_path = None
        except Exception as e:
            print(f"Error accessing agency.shared_state: {e}")
            csv_relative_path = None

        # --- Process based on shared state check --- 
        if csv_relative_path: 
            # Validate path found in shared state
            if (csv_relative_path.startswith(OUTPUT_FOLDER + os.sep) and
                ".." not in csv_relative_path and
                os.path.exists(os.path.join(agency_root, csv_relative_path))):

                processed_csv_signal = True
                # 1. Queue the UI trigger
                system_action_to_queue = {"action": "csv_ready", "path": csv_relative_path}
                # 2. Queue the standard confirmation message (ignore agent's text)
                message_to_queue = ("Agent", {"type": "text", "content": "Okay, the Bottom-of-Funnel keyword data has been generated. You should see the results table displayed now. You can also download the full data using the 'Download CSV' button."})
                print(f"CSV signal processed via shared state for {csv_relative_path}. Queuing UI action and confirmation text. Agent text result will be ignored.")
            else:
                print(f"Error: Found path '{csv_relative_path}' in shared state, but validation/existence failed.")
                system_action_to_queue = {"action": "error", "detail": f"Received signal for CSV via state, but path was invalid or file missing: {csv_relative_path}"}
                processed_csv_signal = True # Mark as handled to skip normal text processing
        else:
             print("No valid CSV path found via shared state check.")

        # --- If CSV wasn't handled via shared state, process agent's text result --- 
        if not processed_csv_signal:
            if isinstance(agent_text_result, str) and agent_text_result:
                # It's a normal text message from the agent
                message_to_queue = ("Agent", {"type": "text", "content": agent_text_result})
                print(f"Processed as Agent Text Reply: {agent_text_result}")
            elif agent_text_result is not None:
                # Handle other unexpected non-None, non-string results
                print(f"Agent returned unhandled type: {type(agent_text_result)}")
                system_action_to_queue = {"action": "error", "detail": f"Agent returned unexpected data type: {type(agent_text_result)}"}
            # else: Agent returned None - do nothing

        print(f"Agent Processing Finished for: {user_message}")

    except Exception as e:
        print(f"Error during agent processing: {e}")
        import traceback
        traceback.print_exc()
        # Ensure error is reported even if other messages were queued
        system_action_to_queue = {"action": "error", "detail": f"Error during agent processing: {e}"}
        message_to_queue = None # Clear any previously determined message on error

    finally:
        # Queue messages - System action first, then agent/confirmation message
        if system_action_to_queue:
            message_queue.put(("System", system_action_to_queue))

        if message_to_queue: # Queue whatever message was decided (confirmation or agent text)
            message_queue.put(message_to_queue)

        set_agent_processing(False)

@app.route('/send_message', methods=['POST'])
def send_message():
    if is_agent_processing():
        return jsonify({"error": "Agent is currently processing. Please wait."}), 429 # Too Many Requests

    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    with data_lock:
        chat_history.append(("User", user_message))

    # Start agent processing in background thread
    # Pass only the latest user message to the agent thread function
    thread = threading.Thread(target=agent_response_worker, args=(user_message,))
    thread.start()

    # Immediately return success, client will poll for updates
    return jsonify({"status": "Message received, agent processing started"})

@app.route('/get_updates', methods=['GET'])
def get_updates():
    updates = []
    while not message_queue.empty():
        try:
            sender, message_data = message_queue.get_nowait()
            # message_data could be text content or a system action dictionary
            updates.append({"sender": sender, "data": message_data})
            if sender != "System": # Don't add system actions to persistent chat history
                 with data_lock:
                     # TODO: Need to refine what exactly gets stored
                     # Store structured data if it's not just text
                     if isinstance(message_data, dict) and message_data.get("type") == "text":
                         chat_history.append((sender, message_data["content"]))
                     elif isinstance(message_data, str):
                          chat_history.append((sender, message_data))
                     # Else: System messages or other types - don't store for now

        except Queue.Empty:
            break
        except Exception as e:
             print(f"Error getting message from queue: {e}")

    with data_lock:
        current_show_form = show_form_flag

    return jsonify({
        "updates": updates,
        "show_form": current_show_form,
        "agent_processing": is_agent_processing()
    })

# --- End Chat Handling Endpoints ---

# Ensure OUTPUT_FOLDER is defined before use
OUTPUT_FOLDER = 'output'

# --- CSV Handling Endpoints ---
@app.route('/get_csv_data', methods=['GET'])
def get_csv_data():
    relative_path = request.args.get('filepath')
    if not relative_path:
        return jsonify({"error": "Missing 'filepath' parameter"}), 400

    if (not relative_path.startswith(OUTPUT_FOLDER + os.sep) or
        '..' in relative_path):
        return jsonify({"error": "Invalid or forbidden file path"}), 403

    full_path = os.path.join(agency_root, relative_path)

    file_exists = os.path.exists(full_path)
    if not file_exists:
         return jsonify({"error": "CSV file not found."}), 404

    try:
        df = pd.read_csv(full_path)
        csv_data_json = df.to_json(orient='split', index=False)
        return jsonify({"status": "success", "data": csv_data_json})
    except pd.errors.EmptyDataError:
        return jsonify({"status": "success", "data": None, "message": "CSV file is empty."})
    except Exception as e:
        print(f"Error reading CSV {full_path}: {e}")
        return jsonify({"error": f"Failed to read or process CSV file: {e}"}), 500

@app.route('/download_csv', methods=['GET'])
def download_csv():
    relative_path = request.args.get('filepath')
    if not relative_path:
        return jsonify({"error": "Missing 'filepath' parameter"}), 400

    if (not relative_path.startswith(OUTPUT_FOLDER + os.sep) or
        '..' in relative_path):
        return jsonify({"error": "Invalid or forbidden file path"}), 403

    try:
        directory_relative_to_root = os.path.dirname(relative_path)
        filename = os.path.basename(relative_path)
        absolute_directory_path = os.path.join(agency_root, directory_relative_to_root)

        if not os.path.exists(os.path.join(absolute_directory_path, filename)):
             return jsonify({"error": "CSV file not found."}), 404

        return send_from_directory(absolute_directory_path, filename, as_attachment=True)

    except Exception as e:
        print(f"Error serving file {relative_path}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Could not serve file"}), 500

if __name__ == '__main__':
    print("Starting Flask UI server with integrated Agency Swarm on http://127.0.0.1:5000")
    app.run(debug=True, port=5000, use_reloader=False) # use_reloader=False important for global state/threads 
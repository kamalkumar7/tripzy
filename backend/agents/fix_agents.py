import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to replace the try block manual parsing:
    # try:
    #     response = response.strip()
    #     ... (if response.startswith...)
    #     response = response.strip()
    #     some_var = json.loads(response)
    
    # We'll use a regex that looks for response = response.strip() down to json.loads(response)
    
    pattern = r'(response = response\.strip\(\).*?=\s*json\.loads\(response\))'
    
    def repl(match):
        text = match.group(1)
        # Find the variable name used for json.loads(response)
        var_match = re.search(r'(\w+)\s*=\s*json\.loads\(response\)', text)
        var_name = var_match.group(1) if var_match else "data"
        return f"response = self.extract_json(response)\n            {var_name} = json.loads(response)"

    new_content = re.sub(pattern, repl, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")
    else:
        print(f"No changes for {filepath}")

directory = r"c:\Users\kk123\OneDrive\Desktop\tripzy\backend\agents"
files = ["hotels_agent.py", "restaurants_agent.py", "place_agent.py", "itinerary_agent.py", "itenary_agent.py"]

for file in files:
    filepath = os.path.join(directory, file)
    if os.path.exists(filepath):
        process_file(filepath)

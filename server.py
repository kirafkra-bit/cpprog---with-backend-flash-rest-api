from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json, os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

@app.route("/data/img/<path:f>")
def data_img(f):
    img_dir = os.path.join(BASE_DIR, "data", "img")
    print("Serving from:", img_dir)  # add this to check in terminal
    return send_from_directory(img_dir, f)

#  Helpers 



def read(f):
    path = os.path.join(DATA_DIR, f)
    return json.load(open(path)) if os.path.exists(path) else []

def write(f, data):
    os.makedirs(DATA_DIR, exist_ok=True)
    json.dump(data, open(os.path.join(DATA_DIR, f), "w"), indent=2)

def next_id(records):
    return max((r.get("id", 0) for r in records), default=0) + 1

# all files kukunin ni flask

@app.route("/")
def index():
    return send_from_directory(os.path.join(BASE_DIR, "pages"), "index.html")

@app.route("/pages/<path:f>")  
def pages(f):   return send_from_directory(os.path.join(BASE_DIR, "pages"), f)

@app.route("/Auth/<path:f>")   
def auth(f):    return send_from_directory(os.path.join(BASE_DIR, "Auth"), f)

@app.route("/Js/<path:f>")     
def js(f):      return send_from_directory(os.path.join(BASE_DIR, "Js"), f)

@app.route("/style/<path:f>")  
def style(f):   return send_from_directory(os.path.join(BASE_DIR, "style"), f)

@app.route("/picture/<path:f>")
def picture(f): return send_from_directory(os.path.join(BASE_DIR, "picture"), f)

# Authorization

@app.route("/api/login", methods=["POST"])
def login():
    b = request.get_json()
    users = read("users.json")
    user  = next((u for u in users if u["username"] == b.get("username","").strip() and u["password"] == b.get("password","").strip()), None)
    if user:
        return jsonify({"success": True, "data": {"username": user["username"], "role": user.get("role", "User")}})
    return jsonify({"success": False, "message": "Invalid username or password"}), 401

@app.route("/api/register", methods=["POST"])
def register():
    b     = request.get_json()
    user  = b.get("username","").strip()
    pw    = b.get("password","").strip()
    if not user or not pw:
        return jsonify({"success": False, "message": "Username and password required"}), 400
    users = read("users.json")
    if any(u["username"] == user for u in users):
        return jsonify({"success": False, "message": "Username already exists"}), 409
    users.append({"username": user, "email": b.get("email",""), "password": pw, "role": b.get("role","User")})
    write("users.json", users)
    return jsonify({"success": True, "message": "Registered successfully"})



# crud / reusable para sa lahat ng modules

def get_all(file):
    return jsonify(read(file))

def add_one(file):
    record  = request.get_json()
    records = read(file)
    record["id"] = next_id(records)
    records.append(record)
    write(file, records)
    return jsonify({"success": True, "data": record})

def update_one(file, rid):
    updates = request.get_json()
    records = read(file)
    for r in records:
        if r.get("id") == rid:
            r.update(updates)
            write(file, records)
            return jsonify({"success": True, "data": r})
    return jsonify({"success": False, "message": "Not found"}), 404

def delete_one(file, rid):
    records = read(file)
    new     = [r for r in records if r.get("id") != rid]
    if len(new) == len(records):
        return jsonify({"success": False, "message": "Not found"}), 404
    write(file, new)
    return jsonify({"success": True})

# rest api toh gamit get tsaka post / for loop ng modules 

for module in ["hr", "payroll", "attendance", "performance"]:
    file = f"{module}.json"

    app.add_url_rule(f"/api/{module}",        f"get_{module}",    lambda f=file: get_all(f),              methods=["GET"])
    app.add_url_rule(f"/api/{module}",        f"add_{module}",    lambda f=file: add_one(f),              methods=["POST"])
    app.add_url_rule(f"/api/{module}/<int:rid>", f"upd_{module}", lambda rid, f=file: update_one(f, rid), methods=["PUT"])
    app.add_url_rule(f"/api/{module}/<int:rid>", f"del_{module}", lambda rid, f=file: delete_one(f, rid), methods=["DELETE"])

# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    os.makedirs(DATA_DIR, exist_ok=True)
    app.run(debug=True, port=5000)
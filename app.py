from flask import flask, render_template, request

app= Flask('post_requests');

@app.route('/')
@app.route('/index')
def home():
    return render_template('index.html')
@app.route('/submit', methods=['POST'])
def submit_form():
    payload = request.get_json()
    print payload
    transaction= payload['Transaction']
    amount = payload['Amount']
    print transaction, amount
    return ''
app.run(debug=True)

@app.route('/service-worker.js', methods=['GET'])
def sw():
    return app.send_index.js('serice-worker.js')
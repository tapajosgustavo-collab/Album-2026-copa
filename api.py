from flask import Flask, jsonify, request, send_from_directory
from backend import carregar_dados, salvar_dados

app = Flask(__name__, static_folder='static')

album = carregar_dados()


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/api/album')
def get_album():
    return jsonify(album)


@app.route('/api/album/<cod>/increment', methods=['POST'])
def increment(cod):
    try:
        for selecao in album.values():
            if cod in selecao['figurinhas']:
                selecao['figurinhas'][cod]['qtd'] += 1
                salvar_dados(album)
                return jsonify({'qtd': selecao['figurinhas'][cod]['qtd']})
        return jsonify({'error': 'not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/album/<cod>/decrement', methods=['POST'])
def decrement(cod):
    try:
        for selecao in album.values():
            if cod in selecao['figurinhas']:
                fig = selecao['figurinhas'][cod]
                if fig['qtd'] > 0:
                    fig['qtd'] -= 1
                    salvar_dados(album)
                return jsonify({'qtd': fig['qtd']})
        return jsonify({'error': 'not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/estatisticas')
def estatisticas():
    total = 980
    adquiridas = sum(1 for s in album.values() for f in s['figurinhas'].values() if f['qtd'] > 0)
    repetidas = sum(f['qtd'] - 1 for s in album.values() for f in s['figurinhas'].values() if f['qtd'] > 1)
    faltam = total - adquiridas
    return jsonify({
        'total': total,
        'adquiridas': adquiridas,
        'repetidas': repetidas,
        'faltam': faltam,
        'porcentagem': round((adquiridas / total) * 100, 1)
    })


if __name__ == '__main__':
    import os
    debug = os.environ.get('FLASK_DEBUG', '1') == '1'
    app.run(host='0.0.0.0', debug=debug)

import json


async def test_get_node_libraries(jp_fetch):
    # When
    response = await jp_fetch("vp4jl", "get_node_libraries")

    # Then
    assert response.code == 200
    payload = json.loads(response.body)
    assert payload

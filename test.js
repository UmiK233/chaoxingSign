const request_1 = require("./utils/request");
const user_1 = require("./functions/user");
const file_1 = require("./utils/file");
const kolorist_1 = require("kolorist");
const prompts_2 = require("./configs/prompts");
const prompts_1 = require("koa");

const a = async () => {
    let params = {};
    const user = (0, file_1.getJsonObject)('configs/storage.json').users[0];
    params = user.params;
    const {...cookies} = params;
    const result = await (0, request_1.request)("https://mobilelearn.chaoxing.com/v2/apis/sign/getLocationLog?courseId=252411901&DB_STRATEGY=COURSEID&STRATEGY_PARA=courseId&classId=120965566", {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    let locationList = JSON.parse(result.data).data;
    for (let i = 0; i < locationList.length; i++) {
        // console.log(locationList[i])
    }
    let signCodeCooke = "chaoxing_cookie=LZhB78A4VfJ%2BkLib%2F9kn4WbNAGN%2FFy2xA92QIwWoTInV9gbBulWc%2BPTbayjTVfEXcrdKZj2X1lvNGqzp3bI5OvFY5jlkB6JEKad51kjDTJHGdSSfPY38f%2FsZJmi2zSJasAiMDHaFSolwTRpHiU3RsR3myiVX%2Fbj%2Bz5AdzQCwMWYIySdtawOdQQJPSesaw%2Fwb7fKNLvW%2FxqH1z1zjS2%2BEtMow9d5bfYeuR7ibevZbUo9RJlEBU%2FAUot%2B0O7lVn42wd5Xi%2ByXe9yIniMsdcRzyU0UIlbldkuU%2BSaVjg%2FCmYGn0oot7Z86uhgwaSx4kc4o7E22QzMaY8wyrl2CITj8tOpAdTt80CxJSiDUy0BXay0RBPhN07A4yWuIt8yZ7dES8lxs0%2B5L4zVDNZyYVRau4wqy5YSvAlkwlqy5MBDbpPA5cX5cYiFm%2Fp4LXn3bQz8w8Ie8kiTHQ1BjOpNv8cfbrYXpCmenjkQkKQzKYWtIHBEZuBXjPyLi9njdoil%2BOIDdz6XkZj8o9MqwKcB%2FJXJrS5jxt2VMYWYsOPHh0Q%2BAzpWcATx3gMF%2FGlSKpkOGZWB5t7y9FBdtq2NffrybtpGMvKRJYIlHjzUD%2BLh5di2ANgjMRlDXULjGPDj2LEVfjPNyzEx3hOVBMJLBcqgmRAlvWHsFqmikkPQjxh8HnAmOIpP12QoqIq32lVneGx8kvA9GxfW6JoedJygLAZvJVdoP%2BNGTFeMnBLjgezfpZyUrg81MHF37mqbb3PXANxRwC1cC1rTxJeGMsHvw4xRqJQjqjKTDUAP9Uovy9dLEjHCry5DvhvWr7t7HO7LqVxmww46vExEG9%2BxPdcX8uWVD%2F5tmOgtoL8isYwl0kA4NAXqprAmZZ5uHAeMRY8UC0QUX68sjG2mfo1roxfO3W%2BliS86C7XB58HzDxJ4ah15d%2BQQCB0QvRtTc9Pmj0GBA%2B%2Bnf2GwWAmSRTtS0yFpQDePNTJTR1YKAhW88qBljVsf2myDgS7Ws4D8TI7oyF6l8pkGIyAdeN2APjRHobMzoy7l3dsHHaUh6BD0C3mLU4ChOZPNGH5S6G%2BeE%2BOYINdoIKvxC6BH%2B51qPjTGzwkFt%2B4EgozGUhBOWLjBWpf7gUAjpDpAaB9DgU7q65m5icKtAopLlpbkcT66dimPP3RHLj7BaCjH%2Fk97QcdQ729L07F4S8Jh7Soym79WD2uQ8u2rvAExa8nJMGOPkNvGLEnMPPgCsk4thyaO%2FSeD4mym%2FJx%2BgeaUUfdIg%3D; chaoxing_refresh=2333";
    let activeId = "6000125321146";
    const signCodeResult = await (0, request_1.request)(`https://oicoc.me/sign/passcheck.php?activeId=${activeId}`, {
        secure: true,
        headers: {
            Cookie: signCodeCooke
        },
    });
    console.log(signCodeResult.data);
}
a()
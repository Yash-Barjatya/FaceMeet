const meet_input = document.getElementById('meet_input')
const join_meeting = () => {
    console.log(meet_input.value)
    if (meet_input.value != "") {
        window.location.href = `${meet_input.value}`
    }
}
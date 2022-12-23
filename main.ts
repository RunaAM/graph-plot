//  initialise the lcd screen
function init_screen() {
    led.enable(false)
    I2C_LCD1602.LcdInit(39)
    I2C_LCD1602.on()
    datalogger.setColumnTitles("timp", "y")
}

// set value HIGH or LOW to a pin (sets the led state to on or off)
function draw_pin(pin: number, value: number) {
    pins.digitalWritePin(outputs[pin], value)
}

//  a simple function 
function calculate_pin_id(val: number): number {
    return 9 - (val + 5)
}

//  shows text on the lcd screen for a certain period of time
function render_text(val: string, time: number) {
    I2C_LCD1602.ShowString(val, 0, 0)
    pause(time)
    I2C_LCD1602.clear()
}

let outputs = [DigitalPin.P0, DigitalPin.P1, DigitalPin.P2, DigitalPin.P12, DigitalPin.P4, DigitalPin.P10, DigitalPin.P6, DigitalPin.P7, DigitalPin.P8]
init_screen()
render_text("ecran initializat", 1000)
function oscilatie_simpla(amplitudine: number, frecventa: number, durata: number) {
    let pin_id: number;
    let timp = 0.01
    while (timp <= durata) {
        pin_id = amplitudine * Math.sin(frecventa * timp)
        datalogger.log(datalogger.createCV("timp", timp), datalogger.createCV("y", pin_id))
        console.log(pin_id)
        pin_id = Math.floor(pin_id)
        pin_id = calculate_pin_id(pin_id)
        draw_pin(pin_id, 1)
        pause(5)
        draw_pin(pin_id, 0)
        timp += 0.01
    }
}

render_text("program terminat", 10000)

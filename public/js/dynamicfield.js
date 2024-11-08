window.onload = function () {
    const totalSectionInput = document.getElementById('totalsections');
    
    totalSectionInput.addEventListener('input', function() {
        const count = parseInt(totalSectionInput.value);
        
        if (!isNaN(count)) {
            generateInputFields(count);
        } else {
            document.getElementById('inputform2').innerHTML = '<p>No valid input provided.</p>';
        }
    });
};

function generateInputFields(count) {
    const container = document.getElementById('inputform2');
    container.innerHTML = ''; // Clear existing fields

    for (let i = 0; i < count; i++) {
        const sectionDiv = document.createElement('div');
        sectionDiv.setAttribute("class", "row mb-3");

        const nameDiv = document.createElement('div');
        nameDiv.setAttribute("class", "col-md-6"); // Half column for name
        nameDiv.innerHTML = `
            <label for="sectionName_${i}" class="form-label">Section Name</label>
            <input type="text" class="form-control" id="sectionName_${i}" name="manager[sections][${i}][name]" placeholder="Section Name" required>
            <div class="invalid-feedback">Please enter a section name</div>
        `;

        const capacityDiv = document.createElement('div');
        capacityDiv.setAttribute("class", "col-md-6"); // Half column for capacity
        capacityDiv.innerHTML = `
            <label for="sectionCapacity_${i}" class="form-label">Section Capacity</label>
            <input type="number" class="form-control" id="sectionCapacity_${i}" name="manager[sections][${i}][capacity]" placeholder="Capacity" required>
            <div class="invalid-feedback">Please enter a valid capacity</div>
        `;

        sectionDiv.appendChild(nameDiv);
        sectionDiv.appendChild(capacityDiv);
        container.appendChild(sectionDiv);
    }
}
